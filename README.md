# Observables

This is a collection of application components and browser APIs implemented as Observable objects.

## Usage

Observables can be used with the **[Observer](https://github.com/web-native/observer) API:**

```html
<!-- Include a component - e.g Web-Monentization -->
<script src="https://unpkg.com/@web-native-js/observables/dist/web-monentization.js"></script>
<!-- Include the Observer API -->
<script src="https://unpkg.com/@web-native-js/observer/dist/main.js"></script>

<!-- Application -->
<script>
    let webmo = new WM.WebMonetization(paymentPointer);
    let indicator = document.querySelector('#indicator');
    // Observe the component's properties
    Observer.observe(webmo, 'state', state => {
        // state.value: pending | started | stopped
        indicator.style.backgroundColor = state.value === 'pending' ? 'blue' : (state.value === 'started' ? 'green' : 'red');
    });
</script>
```

They can also be used as bindings for **[Scoped Scripts](https://github.com/web-native/chtml) API:**

```html
<!-- Include a component - e.g Web-Monentization -->
<script src="https://unpkg.com/@web-native-js/observables/dist/web-monentization.js"></script>
<!-- Include the CHTML polyfill -->
<script src="https://unpkg.com/@web-native-js/chtml/dist/main.js"></script>

<!-- Application -->
<script>
    let webmo = new WM.WebMonetization(paymentPointer);
    document.bind('webmo', webmo);
</script>

<!-- Document -->
<div id="indicator">
    <script type="scoped">
        this.style.backgroundColor = webmo.state === 'pending' ? 'blue' : (webmo.state === 'started' ? 'green' : 'red');
    </script>
</div>
```

## Documentation

[Visit the Docs](https://docs.web-native.dev/observables) or 

## Issues

To report bugs or request features, please submit an [issue](https://github.com/web-native/observables/issues).

## License

MIT.
