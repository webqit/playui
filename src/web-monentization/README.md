# Web Monentization Observable

This is an *Observable* wrapper for the [Web-Monentization API](https://webmonetization.org/). It offers the Web Monentization API as a regular JavaScript object that can be [observed](https://github.com/web-native/observer) live - for use in *reactive* UI development.

Simply include the little script on your page:

```html
<script src="https://unpkg.com/@web-native-js/observables/dist/web-monentization.js"></script>
```
```js
let monentization = WN.WebMonentization.init(payment_pointer);
```

This implementation offers us many benefits:

+ It lets us think of its state as one changing property - `monentization.state`, instead of many events that are difficult to remember - `monetizationpending`, `monetizationstart`, `monetizationstop`.

    ```js
    Observer.observe(monentization, 'state', state => {
        console.log(state.value);           // pending | started | stopped
        console.log(monentization.state);   // pending | started | stopped
    });
    ```

+ It features a `.start()` method that automatically creates the appropriate meta tag in the document head, where not already exists, then, a `.stop()` method that removes it.
+ It makes it easy to implement multiple payment pointers and handles the switching logic behind the scene. Calling the `.start()` method on one instance automatically stops any currently active instance.

    ```js
    let stream1 = WebMonentization.init('$ilp.example.com/me');
    let stream2 = WebMonentization.init('$ilp.example2.com/me');
    // Start the first one...
    stream1.start();
    // Start the second one later on
    setTimeout(() => {
        stream2..start(); // stream1 is deactivated
    });
    ```

+ It can automatically detect browser support for the Web Monetization API and can (optionally) suggest the appropriate browser extension for the user.

    ```js
    let stream1 = WebMonentization.init('$ilp.example.com/me', {prompt: true});
    ```

+ It automatically calculates live totals as the stream progresses - accessible as `monentization.progress.currentTotal` and  `monentization.progress.sessionTotal`.

    ```js
    Observer.observe(monentization, 'progress', progress => {
        console.log(progress.currentTotal);   // {amount:0, value:0}
        console.log(progress.sessionTotal);   // {amount:0, value:0}
    });
    ```

    + `.progress.currentTotal` - This object represents the totals between starts and stops on the instance. It begins at zero on each call to `.start()`. The `.progress.currentTotal.amount` property gives the raw sum of micro payment sent during the stream, while `.progress.currentTotal.value` gives the sum in the format of the active currency.
    + `.progress.sessionTotal` - This object represents the overall totals on the instance. The `.progress.sessionTotal.amount` property gives the raw sum, while `.progress.sessionTotal.value` gives the sum in the format of the active currency.

    The active currency is the `monentization.currency` property.

## Example1 - Programmatic Reactivity

Using the Observer API above, we could programmatically keep monentized sections of our page in sync with the state of our `monentization` object. Here's how that could look:

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

    <script src="https://unpkg.com/@web-native-js/observables/dist/web-monentization.js"></script>
    <script src="https://unpkg.com/@web-native-js/observer/dist/main.js"></script>
    <script>
    
        const WebMonentization = window.WN.WebMonentization;
        const Observer = window.WN.Observer;

        const exclusiveSection = document.querySelector('#exclusive');
        const adsSection = document.querySelector('#ads');

        const monentization = WebMonentization.init('$ilp.example.com/me', {prompt:true}).start();
        Observer.observe(monentization, 'state', state => {
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
        this.style.display = monentization.state === 'started' ? 'block' : 'none';
      </script>
    </div>

    <div>
      <h2>Ads</h2>
      <script type="scoped">
        this.style.display = monentization.state === 'started' ? 'none' : 'block';
      </script>
    </div>

    <script src="https://unpkg.com/@web-native-js/observables/dist/web-monentization.js"></script>
    <script src="https://unpkg.com/@web-native-js/chtml/dist/main.js"></script>
    <script>
    
        const WebMonentization = window.WN.WebMonentization;
        const monentization = WebMonentization.init('$ilp.example.com/me', {prompt:true}).start();
        document.bind({
            monentization: monentization,
        });

    </script>

  </body>

</html>
```

Here, we did away with query selectors by taking our (presentational) logic to their respective locations in the document! We bound our `monentization` instance to the document itself so that we could access it from any location.

We could also forget about manually observing our `monentization` instance as Scoped JS bindings are reactive!

\* Again, you can copy/paste the code to try.