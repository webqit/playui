# Web Monetization Observable

This is an *Observable* wrapper for the [Web-Monetization API](https://webmonetization.org/). It offers the Web Monetization API as a regular JavaScript object that can be [observed](https://github.com/web-native/observer) live - for use in *reactive* UI development.

Simply include the little script on your page:

```html
<script src="https://unpkg.com/@web-native-js/observables/dist/web-monetization.js"></script>
```
```js
let monetization = WN.WebMonetization.init(payment_pointer);
```

This implementation offers us many benefits:

+ It lets us think of its state as one changing property - `monetization.state`, instead of many events that are difficult to remember - `monetizationpending`, `monetizationstart`, `monetizationstop`.

    ```js
    Observer.observe(monetization, 'state', state => {
        console.log(state.value);           // pending | started | stopped
        console.log(monetization.state);   // pending | started | stopped
    });
    ```

+ It features a `.start()` method that automatically creates the appropriate meta tag in the document head, where not already exists, then, a `.stop()` method that removes it.
+ It makes it easy to implement multiple payment pointers and handles the switching logic behind the scene. Calling the `.start()` method on one instance automatically stops any currently active instance.

    ```js
    let stream1 = WebMonetization.init('$ilp.example.com/me');
    let stream2 = WebMonetization.init('$ilp.example2.com/me');
    // Start the first one...
    stream1.start();
    // Start the second one later on
    setTimeout(() => {
        stream2..start(); // stream1 is deactivated
    });
    ```

+ It can automatically detect browser support for the Web Monetization API and can (optionally) suggest the appropriate browser extension for the user.

    ```js
    let stream1 = WebMonetization.init('$ilp.example.com/me', {prompt: true});
    ```

+ It automatically calculates live totals as the stream progresses - accessible as `monetization.progress.currentTotal` and  `monetization.progress.sessionTotal`.

    ```js
    Observer.observe(monetization, 'progress', progress => {
        console.log(progress.value.currentTotal);   // {amount:0, value:0}
        console.log(progress.value.sessionTotal);   // {amount:0, value:0}
    });
    ```

    + `.progress.currentTotal` - This object represents the totals between starts and stops on the instance. It begins at zero on each call to `.start()`. The `.progress.currentTotal.amount` property gives the raw sum of micro payment sent during the stream, while `.progress.currentTotal.value` gives the sum in the format of the active currency.
    + `.progress.sessionTotal` - This object represents the overall totals on the instance. The `.progress.sessionTotal.amount` property gives the raw sum, while `.progress.sessionTotal.value` gives the sum in the format of the active currency.

    The active currency is the `monetization.currency` property.

## Example1 - Programmatic Reactivity

Using the Observer API above, we could programmatically keep monentized sections of our page in sync with the state of our `monetization` object. Here's how that could look:

```html
<html>

  <head>
    <title>Monentized Page</title>
  </head>

  <body>

    <h1>My Blog</h1>

    <div id="exclusive" style="display:none">
      <h2>Exclusive Content</h2>
    </div>

    <div id="adverts">
      <h2>Ads</h2>
    </div>

    <script src="https://unpkg.com/@web-native-js/observables/dist/web-monetization.js"></script>
    <script src="https://unpkg.com/@web-native-js/observer/dist/main.js"></script>
    <script>
    
        const WebMonetization = window.WN.WebMonetization;
        const Observer = window.WN.Observer;

        const exclusiveSection = document.querySelector('#exclusive');
        const adsSection = document.querySelector('#ads');

        const monetization = WebMonetization.init('$ilp.example.com/me').start();
        Observer.observe(monetization, 'state', state => {
            if (state.value === 'started') {
                exclusiveSection.style.display = 'block';
                adsSection.style.display = 'none';
            } else {
                exclusiveSection.style.display = 'none';
                adsSection.style.display = 'block';
            }
        });

    </script>

  </body>

</html>
```

\* You can copy/paste the code to try.

## Example2 - Automatic Reactivity with Scoped JS

Life gets a lot easier using Observables together with the [Scoped JS](https://github.com/web-native/chtml) technology. Scoped JS can automatically keep the UI in sync with an observable object; all we would do is bind it!

```html
<html>

  <head>
    <title>Monentized Page</title>
  </head>

  <body>

    <h1>My Blog</h1>

    <div style="display:none">
      <h2>Exclusive Content</h2>
      <script type="scoped">
        this.style.display = monetization.state === 'started' ? 'block' : 'none';
      </script>
    </div>

    <div>
      <h2>Ads</h2>
      <script type="scoped">
        this.style.display = monetization.state === 'started' ? 'none' : 'block';
      </script>
    </div>

    <script src="https://unpkg.com/@web-native-js/observables/dist/web-monetization.js"></script>
    <script src="https://unpkg.com/@web-native-js/chtml@1.1.3/dist/main.js"></script>
    <script>
    
        const WebMonetization = window.WN.WebMonetization;
        const monetization = WebMonetization.init('$ilp.example.com/me').start();
        document.bind({
            monetization: monetization,
        });

    </script>

  </body>

</html>
```

Here, we did away with query selectors by taking our (presentational) logic to their respective locations in the document! We bound our `monetization` instance to the document itself so that we could access it from any location.

We could also forget about manually observing our `monetization` instance as Scoped JS bindings are reactive!

\* Again, you can copy/paste the code to try.

**A Little More User Control**

It would be a good idea to let the user decide when to begin streaming payment. This is easy to do using the `.start()` and `.stop()` methods of the API. This time, we let the user call these methods instead of hard-coding that ourself.

Below, we've introduced a clickable anchor tag that toggles the current `monetization` instance on its `.start()` and `.stop()` methods.

```html
<html>

  <head>
    <title>Monentized Page</title>
  </head>

  <body>

    <h1>My Blog</h1>
    <div style="margin-bottom: 20px;">
        <a href="#">
            <script type="scoped">
                this.innerHTML = monetization.state === 'started' ? '(View with Ads)' : '(View without Ads)';
                this.addEventListener('click', () => {
                    if (monetization.state === 'started') {
                        monetization.stop();
                    } else {
                        monetization.start();
                    }
                });
            </script>
        </a>
    </div>

    <div style="padding: 20px; border: 1px solid gainsboro;">
      <h2>Exclusive Content</h2>
      <script type="scoped">
        this.style.display = monetization.state === 'started' ? 'block' : 'none';
      </script>
    </div>

    <div style="padding: 20px; border: 1px solid gainsboro;">
      <h2>Ads</h2>
      <script type="scoped">
        this.style.display = monetization.state === 'started' ? 'none' : 'block';
      </script>
    </div>

    <script src="https://unpkg.com/@web-native-js/observables/dist/web-monetization.js"></script>
    <script src="https://unpkg.com/@web-native-js/chtml@1.1.3/dist/main.js"></script>
    <script>
    
        const WebMonetization = window.WN.WebMonetization;
        const monetization = WebMonetization.init('$ilp.example.com/me');
        document.bind({
            monetization: monetization,
        });

    </script>

  </body>

</html>
```
