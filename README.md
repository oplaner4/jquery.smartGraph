# Jquery.smartGraph
Free, easy to use, javascript library for generating beautiful vector graphs with many customizations.

Current stable version: **1.0.0**

### Features
Jquery.smartGraph supports:
* Highly customizable design
* Responsive layout
* Drawing points and functions
* Custom rendering and modifying of objects
* Moving and scaling (zooming)
* Predefined keyboard and mouse control


### Installation and dependencies
SmartGraph is built on and works properly with [jQuery](http://jquery.com/).

#### 1. Include JS/CSS
Include the following code in the `<head>` tag of your HTML:

```html
<!-- include jQuery -->
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<!-- include jquery.smartGraph css/js-->
<link rel="stylesheet" href="/dist/css/jquery.smartGraph.min.css">
<script type="text/javascript" src="/dist/js/jquery.smartGraph.min.js"></script>
```

#### 2. Usage

```javascript
$('#myElem').smartGraph([options])
```

```html
<div class="smart-graph" id="myElem">
    <canvas width="1600" height="900"></canvas>
</div>
```

- **options** (optional)
  - Type: `Object`
  - Default options to be changed, see the list of available options below.
  
#### 3. Initialization

You can use the following code with default options.

`null` properties inherit their values from other properties.

```javascript
$(function() {
    $('#myElem').smartGraph({
        color: '#343a40',
        axises: {
            thickness: null, /* inherits from lines.thickness */
            color: null, /* inherits from lines.color */
            ticks: {
                step: 1,
                size: 8,
                thickness: null, /* inherits from axises.thickness */
                color: null, /* inherits from lines.color */
                titles: {
                    font: '10px Calibri',
                    padding: 10,
                    color: null, /* inherits from texts.color */
                    render: function (value, axisCreatorManager) {
                        return axisCreatorManager.getOptimallyRoundedTick(value);
                    }
                }
            },
            labels: {
                font: '20px Calibri',
                color: null  /* inherits from texts.color */
            },
            x: {
                color: null, /* inherits from axises.color */
                label: {
                    caption: 'x',
                    color: null,  /* inherits from axises.labels.color */
                    padding: 20
                },
                ticks: {
                    step: null, /* inherits from axises.ticks.step */
                    color: null, /* inherits from axises.color */
                    titles: {
                        color: null, /* inherits from axises.ticks..titles.color */
                        render: null /* inherits from axises.ticks.titles.render */
                    }
                }
            },
            y: {
                color: null, /* inherits from axises.color */
                label: {
                    caption: 'y',
                    color: null, /* inherits from axises.labels.color */
                    padding: 20
                },
                ticks: {
                    step: null, /* inherits from axises.ticks.step */
                    color: null, /* inherits from axises.color */
                    titles: {
                        color: null, /* inherits from axises.ticks.titles.color */
                        render: null /* inherits from axises.ticks.titles.render */
                    }
                }
            }
        },
        data: {
            points: [],
            functions: []
        },
        point: {
            size: 10,
            thickness: 2,
            color: null, /* inherits from color */
            hintlines: {
                show: false,
                color: null, /* inherits from lines.color */
                thickness: null, /* inherits from lines.thickness */
                dash: [2, 2]
            },
            label: {
                font: '13px Calibri',
                color: null, /* inherits from texts.color */
                padding: 7,
                render: function (x, y) {
                    return '(' + x.roundDigits(2) + ', ' + y.roundDigits(2) + ')';
                }
            }
        },
        'function': {
            step: null, /* inherits from axises.x.ticks.step */
            modifier: function () {
                return null;
            },
            connectlines: {
                show: true,
                color: null, /* inherits from lines.color */
                thickness: null, /* inherits from lines.thickness */
                dash: []
            },
            points: {
                color: null, /* inherits from point.color */
                size: null, /* inherits from point.size */
                thickness: null, /* inherits from point.thickness */
                hintlines: {
                    show: null, /* inherits from point.hintlines.show */
                    color: null, /* inherits from point.hintlines.color */
                    thickness: null, /* inherits from point.hintlines.thickness */
                    dash: null /* inherits from point.hintlines.dash */
                },
                labels: {
                    font: null, /* inherits from point.label.font */
                    color: null, /* inherits from point.label.color */
                    padding: null, /* inherits from point.label.padding */
                    render: function () {
                        return '';
                    }
                }
            }
        },
        lines: {
            color: null, /* inherits from color */
            thickness: 1
        },
        texts: {
            color: null /* inherits from color */
        },
        move: {
            x: 0,
            y: 0
        },
        responsive: {
            enable: true,
            ratio: 16 / 9
        }
    });
});
```


### Options

#### color
- Type: `String`
- Default: `#343a40`

A general color used mainly for an inheritance. You can use this together with `lines.color` and `texts.color` to set quickly your own theme.

#### axises.thickness
- Type: `Number`
- Default: `null`
- Inherited: `lines.thickness`

#### axises.color
- Type: `String`
- Default: `null`
- Inherited: `lines.color`

#### axises.ticks.step
- Type: `Number`
- Default: `1`

#### axises.ticks.size
- Type: `Number`
- Default: `8`

#### axises.ticks.thickness
- Type: `Number`
- Default: `null`
- Inherited: `axises.thickness`

#### axises.ticks.color
- Type: `String`
- Default: `null`
- Inherited: `lines.color`

#### axises.ticks.titles.font
- Type: `String`
- Default: `10px Calibri`

See the documentation here: https://www.w3schools.com/tags/canvas_font.asp

#### axises.ticks.titles.padding
- Type: `Number`
- Default: `10`

#### axises.ticks.titles.color
- Type: `String`
- Default: `null`
- Inherited: `texts.color`

#### axises.ticks.titles.render (value, axisCreatorManager)
- Returns: `String`

```javascript
titles: {
     render: function (value, axisCreatorManager) {

          return axisCreatorManager.getOptimallyRoundedTick(value); /* default */

          /* or */

          return '';  /* hide */

          /* or */

          if (axisCreatorManager.isNegative()) {
              return value.toFixed(3);  /* 3 decimal places on negative axis */
          }

          /* or */

          return value === 0 ? '' : value;  /* hide center tick title */
     }
}
```

#### axises.labels.font
- Type: `String`
- Default: `20px Calibri`

See the documentation here: https://www.w3schools.com/tags/canvas_font.asp

#### axises.labels.color
- Type: `String`
- Default: `null`
- Inherited: `texts.color`

#### axises.x.label.caption
- Type: `String`
- Default: `x`

#### axises.y.label.caption
- Type: `String`
- Default: `y`

#### axises.(x or y).color
- Type: `String`
- Default: `null`
- Inherited: `axises.color`

#### axises.(x or y).label.color
- Type: `String`
- Default: `null`
- Inherited: `axises.labels.color`

#### axises.(x or y).label.padding
- Type: `String`
- Default: `20`

Use negative value to move label to the opposite side of the axis.

#### axises.(x or y).ticks.step
- Type: `Number`
- Default: `null`
- Inherited: `axises.ticks.step`

#### axises.(x or y).ticks.color
- Type: `String`
- Default: `null`
- Inherited: `axises.ticks.color`

#### axises.(x or y).ticks.titles.color
- Type: `String`
- Default: `null`
- Inherited: `axises.ticks.titles.color`

#### axises.(x or y).ticks.titles.render (value, settingsManager)
- Returns: `String`
- Default: `null`
- Inherited: `axises.ticks.titles.render`

Check the option `axises.ticks.titles.render` above to see example of use.

#### data.points
- Type: `Array[Object]`
- Default: `[]`

Points collection to be drawn into the graph. Specify compulsory `x` and `y` coord for each point.

Additionaly you can replace general options of `point` listed below.

Use methods `addData` and `updateData` to set them dynamically.

```javascript
data: {
     points: [
        {
            x: 4, /* compulsory */
            y: -1 /* compulsory */
        },
        {
            x: 5,
            y: 3,
            size: 15,
            hintlines: {
                show: true
            },
            label: {
                padding: 10
            }
        }
     ]
}
```

#### point.size
- Type: `Number`
- Default: `10`

#### point.thickness
- Type: `Number`
- Default: `2`

#### point.color
- Type: `String`
- Default: `null`

#### point.hintlines.show
- Type: `Boolean`
- Default: `false`

#### point.hintlines.color
- Type: `String`
- Default: `null`

#### point.hintlines.thickness
- Type: `Number`
- Default: `null`

#### point.hintlines.dash
- Type: `Array[Number]`
- Default: `[2, 2]`

#### point.label.font
- Type: `String`
- Default: `13px Calibri`

See the documentation here: https://www.w3schools.com/tags/canvas_font.asp

#### point.label.color
- Type: `String`
- Default: `null`

#### point.label.padding
- Type: `Number`
- Default: `7`

#### point.label.render (x, y, settingsManager)
- Returns: `String`

You can also use defined Number prototype function `roundDigits (digits)` that rounds the number upto the specified decimal places.

```javascript
label: {
     render: function (x, y, settingsManager) {

          return '(' + x.roundDigits(2) + ', ' + y.roundDigits(2) + ')'; /* default, coords rounded upto two decimal places */

          /* or */

          if (settingsManager.getScale() > settingsManager.getDefaultScale() + 50) {
               /* large scale only */

               return ...; /* whatever */
          }

          /* or */
            
          return '';  /* hide */
     }
}
```

#### data.functions
- Type: `Array[Object]`
- Default: `[]`

Functions collection to be drawn into the graph. Specify compulsory `relation` and `interval` for each function.

Objects inherit options from the `function` object.
Additionaly you can replace general options  of  `function` listed below.

Use methods `addData` and `updateData` to set them dynamically.

```javascript
data: {
     functions: [
        {
            relation: x => x + 2, /* compulsory */
            interval: [-5, 5] /* compulsory */
        },
        {
            relation: x => Math.pow() + 2,
            interval: [-5, 5],
            step: .1,
            connectlines: {
                thickness: 4
            },
            points: {
                size: 0 /* hide points */
            }
        },
        {
            relation: x => Math.tan(x),
            interval: [-4, 4],
            modifier: function (_x, y, _prevX, prevY) {
                /* hide incorrect connectlines */
                if (y < 0 && prevY !== null && prevY > 0) {
                    return {
                        connectlines: {
                            show: false
                        }
                    }
                }

                return {
                    connectlines: {
                        show: true
                    }
                };
            }
        }
     ]
}
```

#### function.step
- Type: `Number`
- Default: `null`
- Inherited: `axises.x.ticks.step`

#### function.modifier (x, y, prevX, prevY, settingsManager)
- Returns: `Object`

You can use this callback to control the function course.

Arguments `prevX` (the previous x from an interval) and `prevY` (the previous y) are `null` while rendering the first point. 

```javascript
'function': {
    modifier: function (x, y, prevX, prevY, settingsManager) {
        /* positive values only */
        if (y < 0) {
            return {
                connectlines: {
                    show: false
                },
                points: {
                    size: 0 /* hide */
                }
            }
        }

        /* or */

        return null; /* default, don't modify */
    }
}
```

#### function.connectlines.show
- Returns: `Boolean`
- Default: `true`

#### function.connectlines.color
- Type: `String`
- Default: `null`
- Inherited: `lines.color`

#### function.connectlines.thickness
- Type: `Number`
- Default: `null`
- Inherited: `lines.thickness`

#### function.connectlines.dash
- Type: `Array[Number]`
- Default: `[]`

#### function.points.color
- Type: `String`
- Default: `null`
- Inherited: `point.color`

#### function.points.size
- Type: `Number`
- Default: `null`
- Inherited: `point.size`

Use `0` to hide (for example to show connectlines only).

#### function.points.thickness
- Type: `Number`
- Default: `null`
- Inherited: `point.thickness`

#### function.points.hintlines.show
- Type: `Boolean`
- Default: `null`
- Inherited: `point.hintlines.show`

#### function.points.hintlines.color
- Type: `String`
- Default: `null`
- Inherited: `point.hintlines.color`

#### function.points.hintlines.thickness
- Type: `Number`
- Default: `null`
- Inherited: `point.hintlines.thickness`

#### function.points.hintlines.dash
- Type: `Array[number]`
- Default: `null`
- Inherited: `point.hintlines.dash`

#### function.points.labels.font
- Type: `String`
- Default: `null`
- Inherited: `point.labels.font`

#### function.points.labels.color
- Type: `String`
- Default: `null`
- Inherited: `point.labels.color`

#### function.points.labels.padding
- Type: `Number`
- Default: `null`
- Inherited: `point.labels.padding`

#### function.points.labels.render (x, y, settingsManager)
- Returns: `String`

```javascript
labels: {
     render: function (x, y, settingsManager) {
          return '';  /* default, hide */

          /* see point.label.render to get more examples */
     }
}
```

#### lines.color
- Type: `String`
- Default: `null`
- Inherited: `color`

#### lines.thickness
- Type: `Number`
- Default: `1`

#### texts.color
- Type: `String`
- Default: `null`
- Inherited: `color`

#### move.x
- Type: `Number`
- Default: `0`

#### move.y
- Type: `Number`
- Default: `0`

#### responsive.enable
- Type: `Boolean`
- Default: `true`

#### responsive.ratio
- Type: `Number`
- Default: `16 / 9`

### Options callbacks arguments

smartGraph library works with the following managers which are provided in callbacks as arguments. You can access their methods (getters and boolean queries) to find out useful information.

**Attention:** Using of other manager's methods then listed below (etc. private setters), or modifying its private underline properties can cause unexpectable behaviour.

#### settingsManager
- Type: `Object`
- Methods: `getElement()`, `getScaledDistance()`, `getWidth()`, `getHeight()`, `getCenter()`, `getCanvas()`, `getScale()`  and `getDefaultScale()`

#### axisCreatorManager
- Type: `Object`
- Methods: `getSettingsManager()`,`getAxis()`, `isVisible()`, `isNegative()`, `getLength()`, `getCountNecessaryTicks()`, `getOptimallyRoundedTick(value)` and `getAxisOptions()`

### Defaults
If you want to change default settings, use the following code:
```javascript
$.extend( true, $.fn.smartGraph.defaults, {
    lines: {
        color: '#ffffff'
    }
} );
```

### Methods

Use only after **initialization**.

```javascript
$('.myElems').smartGraph('methodName', argument1, argument2, ...);

/* or */

$('.myElems').each(function () {
    $(this).smartGraph('instance').methodName(argument1, argument2, ...);
});

```


#### setOptions (options)
Updates dynamically options. The graph is reconstructed.

```javascript
$('#myElem').smartGraph('setOptions', {
    lines: {
        color: '#ffffff'
    }
});
```

#### addData (data)
Adds data to be drawn into the graph.

```javascript
$('#myElem').smartGraph('addData', {
    points: [
        {
            x: 4,
            y: -2
        }
    ]
});
```

#### updateData (data)
Updates data to be drawn into the graph.

#### moveRight (), moveLeft ()
Moves the graph based on the ticks distance. You can use predefined arrow keys control in the hover state.

#### moveUp (), moveDown ()
Moves the graph based on the ticks distance. You can use predefined arrow keys control in the hover state.

#### zoomIn (), zoomOut ()
Changes a scale of the graph. You can use predefined mouse wheel control or +- keys in the hover state.

### Events

Use the following code to set callback on event. Set them before smartGraph initialization.

```javascript
$('#myElem').on('smartGraph.eventName', function (e, settingsManager) {
	
}).smartGraph();
```

#### click (settingsManager, x, y)

```javascript
$('#myElem').on('smartGraph.click', function (_e, settingsManager, x, y) {
    $(this).smartGraph('addData', {
        points: [
            {
                x: x,
                y: y,
                hintlines: {
                    show: true
                }
            }
        ]
    });
}).smartGraph();
```

#### init

Fires after smart graph had been fully initialized.


### License
jquery.smartGraph may be freely distributed under the MIT license.
