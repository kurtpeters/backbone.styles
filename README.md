# backbone.styles
Backbone.Styles brings CSS prepossessing to JS development. This library is in the process of development. The following documentation is pseudo code outlining current functionality of the software.

## Backbone.Styles()

#### JavaScript
```js
Backbone.Styles({

    ".container": {
        "margin": "0 auto",
        "padding": "1rem",
        "width": "1200px"
    }

});
```

#### HTML
```html
<head>

    <style id="backbone-styles" type="text/css">

        .container {
            margin: 0 auto;
            padding: 1rem;
            width: 1200px;
        }

    </style>

</head>

<body>

    ...

</body>
```

## Backbone.View.prototype.styles

#### JavaScript
```js
var View = Backbone.View.extend({

    "className": "container",

    "tagName": "section",

    "styles": {
        "margin": "0 auto",
        "padding": "1rem",
        "width": "1200px"
    }

});

$(document.body).append(new View());
```

#### HTML
```html
<head>

    <style id="backbone-styles" type="text/css">

        section.container {
            margin: 0 auto;
            padding: 1rem;
            width: 1200px;
        }

    </style>

</head>

<body>

    <section class="container"></section>

</body>
```

##@mixin

#### JavaScript
```js
Backbone.Styles.registerMixin('container', function(containerWidth) {

    return {
        "margin": "0 auto",
        "padding": "1rem",
        "width": containerWidth
    }

});
```

```js
var View = Backbone.View.extend({

    "tagName": "section",

    "styles": {
        "@mixin:container": "(900px)"
    }

});

$(document.body).append(new View());
```

#### HTML
```html
<head>

    <style id="backbone-styles" type="text/css">

        section {
            margin: 0 auto;
            padding: 1rem;
            width: 900px;
        }

    </style>

</head>

<body>

    <section></section>

</body>
```

##@parent

#### JavaScript
```js
var View = Backbone.View.extend({

    "className": "hero",

    "styles": {
        "@parent": ".container",
        "font-size": "1rem"
    }

});

$('.container').append(new View());
```

#### HTML
```html
<head>

    <style id="backbone-styles" type="text/css">

        .container > div.hero {
            font-size: 1rem;
        }

    </style>

</head>

<body>

    <section class="container">
        <div class="hero"></div>
    </section>

</body>
```

##@root

#### JavaScript
```js
var View = Backbone.View.extend({

    "className": "list-item",

    "tagName": "li"

    "styles": {
        "font-size": "1rem"
        "@root": {
            ".list": {
                "text-decoration": "none";
                "li": {
                    "display": "block"
                    "float": "left";
                }
            }
        },
    }

});

$('.list').append(new View());
```

#### HTML
```html
<head>

    <style id="backbone-styles" type="text/css">

        li.list-item {
            font-size: 1rem;
        }

        .list {
            text-decoration: none;
        }

        .list li {
            display: block;
            float: left;
        }

    </style>

</head>

<body>

    <ul class="list">
        <li class="list-item"></li>
    </ul>

</body>
```

##toJSON

Return current list of styles in `Object` format.

```js
var styles = Backbone.Styles.toJSON();
```