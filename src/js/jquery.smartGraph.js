/**
* jquery.smartGraph 1.0.0
* https://github.com/oplaner4/jquery.smartGraph
* by Ondrej Planer, oplaner4@gmail.com
*
*
* This library requires jQuery.js
* See the documentation before using this library please
* jquery.smartSticky.js may be freely distributed under the MIT license.
*
* Copyright 2020, Ondrej Planer
 *
 *
 * PRESERVE THIS PLEASE
*/


(function (factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else if (typeof exports !== "undefined") {
        module.exports = factory(require("jquery"));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
    /** Protection of jQuery's $ alias */
    "use strict";
    var PLUGIN = 'smartGraph';

    var smartGraphManager = function (elem, options) {
        var self = this;
        self._settingsManagerInstance = new smartGraphSettingsManager(options, elem);
        self._ctxManagerInstance = new smartGraphCtxManager(self._settingsManagerInstance);
        self._creatorManagerInstance = new smartGraphCreatorManager(self._ctxManagerInstance);

        self._mousePosition = null;
        self._activeState = false;
        self._mouseMovingState = false;
        self._movingStateTimeout = null;

        $(window).on('resize', function () {
            if (self.getSettingsManager().getOptions().responsive.enable) {
                self.getCtxManager().clear();
                self.getSettingsManager().updateWidth().updateHeight();
                self.create();
            };
        }).on('keydown', function (event) {
            if (self._activeState) {
                if (event.which == 38) {
                    event.preventDefault();
                    self.moveUp();
                }

                if (event.which == 40) {
                    event.preventDefault();
                    self.moveDown();
                }

                if (event.which == 37) {
                    event.preventDefault();
                    self.moveLeft();
                }

                if (event.which == 39) {
                    event.preventDefault();
                    self.moveRight();
                }

                if (event.which == 107) {
                    event.preventDefault();
                    self.zoomIn();
                }

                if (event.which == 109) {
                    event.preventDefault();
                    self.zoomOut();
                }
            }
        }).trigger('resize');

        self.reconstruct().getSettingsManager().getElement().addClass($.fn.smartGraph.classes.root).on('mousemove', function (e) {
            var offset = self.getSettingsManager().getElement().offset();

            if (self._mouseMovingState) {
                self.setOptions({
                    move: {
                        x: self.getSettingsManager().getOptions().move.x - self.getMousePosition().getX() - offset.left + e.clientX,
                        y: self.getSettingsManager().getOptions().move.y + self.getMousePosition().getY() + offset.top - e.clientY - $(window).scrollTop(),
                    }
                });
            }

            self.setMousePosition(e.clientX - offset.left, e.clientY - offset.top + $(window).scrollTop());
        }).on('mousedown', function (e) {
            e.preventDefault();
            self._movingStateTimeout = setTimeout(function () {
                self._mouseMovingState = true;
                self.getSettingsManager().getElement().addClass($.fn.smartGraph.classes.moving);
            }, 100);

            $(this).trigger(PLUGIN + '.click', [
                self.getSettingsManager(),
                (self.getMousePosition().getX() - self.getSettingsManager().getCenter().getX()) / self.getSettingsManager().getScale(),
                (self.getSettingsManager().getCenter().getY() - self.getMousePosition().getY()) / self.getSettingsManager().getScale()
            ]);
        }).on('mouseup', function () {
            clearTimeout(self._movingStateTimeout);
            $(this).removeClass($.fn.smartGraph.classes.moving);
            self._mouseMovingState = false;
        }).on('mouseover mouseout', function () {
            self._mouseMovingState = false;
            self.setMousePosition(self.getSettingsManager().getCenter());
        }).on('mouseover', function () {
            self._activeState = true;
        }).on('mouseout', function () {
            self._activeState = false;
        }).on('wheel', function (e) {
            e.preventDefault();

            if (e.originalEvent.wheelDelta > 1) {
                self.zoomIn();
            }
            else {
                self.zoomOut();
            }
        }).trigger(PLUGIN + '.init', [self.getSettingsManager()]);
    };

    smartGraphManager.prototype.getSettingsManager = function () {
        return this._settingsManagerInstance;
    };

    smartGraphManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphManager.prototype.getCreatorManager = function () {
        return this._creatorManagerInstance;
    };

    smartGraphManager.prototype.getMousePosition = function () {
        return this._mousePosition;
    }

    smartGraphManager.prototype.setMousePosition = function (x, y) {
        this._mousePosition = new smartGraphPointManager(x, y, true);
        return this;
    }

    smartGraphManager.prototype.processData = function () {
        var self = this;

        self.getSettingsManager().getOptions().data.points.forEach(o => {
            self.getCreatorManager().drawPoint(o);
        });

        self.getSettingsManager().getOptions().data.functions.forEach(o => {
            self.getCreatorManager().drawFunction(o);
        });

        return self;
    };

    smartGraphManager.prototype.create = function () {
        this.processData().getCreatorManager().constructAxises();
        return this;
    }

    smartGraphManager.prototype.reconstruct = function () {
        this.getCtxManager().clear();
        return this.create();
    };

    smartGraphManager.prototype.setOptions = function (options) {
        this.getSettingsManager().setOptions(options, true);
        return this.reconstruct();
    };

    smartGraphManager.prototype.updateData = function (data) {
        return this.setOptions({
            data: data
        });
    }

    smartGraphManager.prototype.addData = function (data) {
        var result = this.getSettingsManager().getOptions().data;

        if (data.hasOwnProperty('points')) {
            data.points.forEach(p => {
                result.points.push(p);
            });
        }

        if (data.hasOwnProperty('functions')) {
            data.functions.forEach(o => {
                result.functions.push(o);
            });
        }

        return this.updateData(result);
    }

    smartGraphManager.prototype.moveRight = function () {
        return this.setOptions({
            move: {
                x: this.getSettingsManager().getOptions().move.x - this.getSettingsManager().getTicksDistance('x')
            }
        });
    }

    smartGraphManager.prototype.moveLeft = function () {
        return this.setOptions({
            move: {
                x: this.getSettingsManager().getOptions().move.x + this.getSettingsManager().getTicksDistance('x')
            }
        });
    }

    smartGraphManager.prototype.moveUp = function () {
        return this.setOptions({
            move: {
                y: this.getSettingsManager().getOptions().move.y - this.getSettingsManager().getTicksDistance('y')
            }
        });
    }

    smartGraphManager.prototype.moveDown = function () {
        return this.setOptions({
            move: {
                y: this.getSettingsManager().getOptions().move.y + this.getSettingsManager().getTicksDistance('y')
            }
        });
    }

    smartGraphManager.prototype.zoomIn = function () {
        this.getSettingsManager().increaseScale();
        return this.reconstruct();
    }

    smartGraphManager.prototype.zoomOut = function () {
        this.getSettingsManager().decreaseScale();
        return this.reconstruct();
    }




    var smartGraphCreatorManager = function (ctxManagerInstance) {
        this._ctxManagerInstance = ctxManagerInstance;
    }

    smartGraphCreatorManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphCreatorManager.prototype.drawAxisesLabels = function () {
        this.getCtxManager()
            .setColor(this.getCtxManager().getSettingsManager().getOptions().axises.x.label.color)
            .setStartPoint(
                new smartGraphPointManager(
                    this.getCtxManager().getSettingsManager().getWidth(),
                    this.getCtxManager().getSettingsManager().getCenter().getY() + this.getCtxManager().getSettingsManager().getOptions().axises.x.label.padding,
                    true
                )
            )
            .drawText(
                this.getCtxManager().getSettingsManager().getOptions().axises.x.label.caption,
                this.getCtxManager().getSettingsManager().getOptions().axises.labels.font,
                'right', 'top'
            )
            .setColor(this.getCtxManager().getSettingsManager().getOptions().axises.y.label.color)
            .setStartPoint(
                new smartGraphPointManager(this.getCtxManager().getSettingsManager().getCenter().getX() - this.getCtxManager().getSettingsManager().getOptions().axises.y.label.padding, 0, true)
            ).drawText(
                this.getCtxManager().getSettingsManager().getOptions().axises.y.label.caption,
                this.getCtxManager().getSettingsManager().getOptions().axises.labels.font,
                'right', 'top'
        );

        return this;
    }

    smartGraphCreatorManager.prototype.getAxisXNegativeCreatorManager = function () {
        return new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'x',
            new smartGraphPointManager(0, this.getCtxManager().getSettingsManager().getCenter().getY(), true)
        );
    }

    smartGraphCreatorManager.prototype.constructAxises = function () {
        this.drawAxisesLabels().drawCenterTitle().getAxisXNegativeCreatorManager().construct();

        new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'x',
            new smartGraphPointManager(this.getCtxManager().getSettingsManager().getWidth(), this.getCtxManager().getSettingsManager().getCenter().getY(), true)
        ).construct();

        new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'y',
            new smartGraphPointManager(this.getCtxManager().getSettingsManager().getCenter().getX(), 0, true)
        ).construct();

        new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'y',
            new smartGraphPointManager(this.getCtxManager().getSettingsManager().getCenter().getX(), this.getCtxManager().getSettingsManager().getHeight(), true)
        ).construct();

        return this;
    };

    smartGraphCreatorManager.prototype.drawCenterTitle = function () {
        this.getCtxManager()
            .setColor(this.getCtxManager().getSettingsManager().getOptions().axises.ticks.titles.color)
            .setStartPoint(new smartGraphPointManager(-this.getCtxManager().getSettingsManager().getModifiedTickTitleDistance(), -1 * this.getCtxManager().getSettingsManager().getModifiedTickTitleDistance(), false))
            .drawText(
                this.getCtxManager().getSettingsManager().getOptions().axises.ticks.titles.render(0, this.getAxisXNegativeCreatorManager()),
                this.getCtxManager().getSettingsManager().getOptions().axises.ticks.titles.font,
                'right',
                'top'
            );

        return this;
    };

    smartGraphCreatorManager.prototype.drawPoint = function (o) {
        o = $.extend(true, {}, this.getCtxManager().getSettingsManager().getOptions().point, o);

        var d = o.size / (2 * this.getCtxManager().getSettingsManager().getScale());

        this.getCtxManager()
            .setColor(o.color)
            .setStartPoint(new smartGraphPointManager(o.x - d, o.y, false))
            .drawLine(new smartGraphPointManager(o.x + d, o.y, false), o.thickness, [])
            .setStartPoint(new smartGraphPointManager(o.x, o.y - d, false))
            .drawLine(new smartGraphPointManager(o.x, o.y + d, false), o.thickness, []);


        if (o.hintlines.show) {
            this.getCtxManager()
                .setColor(o.hintlines.color)
                .setStartPoint(new smartGraphPointManager(o.x, o.y, false))
                .drawLine(new smartGraphPointManager(0, o.y, false), o.hintlines.thickness, o.hintlines.dash)
                .drawLine(new smartGraphPointManager(o.x, 0, false), o.hintlines.thickness, o.hintlines.dash)
        }


        this.getCtxManager()
            .setColor(o.label.color)
            .setStartPoint(
                new smartGraphPointManager(
                    o.x + (o.x > 0 ? 1 : -1) * o.label.padding / this.getCtxManager().getSettingsManager().getScale(),
                    o.y + (o.y > 0 ? 1 : -1) * o.label.padding / this.getCtxManager().getSettingsManager().getScale(),
                    false
                )
        ).drawText(
            o.label.render(o.x, o.y, this.getCtxManager().getSettingsManager()),
                o.label.font,
                o.x < 0 ? 'right' : 'left',
                o.y < 0 ? 'top' : 'bottom'
            )
        

        return this;
    };

    smartGraphCreatorManager.prototype.drawFunction = function (o) {
        o = $.extend(true, {}, this.getCtxManager().getSettingsManager().getOptions().function, o);

        var prevPoint = null;

        for (var x = o.interval[0]; x <= o.interval[1]; x += o.step) {
            var y = o.relation(x);
            if (Number.isFinite(y) && !Number.isNaN(y)) {
                o = $.extend(true, {}, o, o.modifier(x, y, prevPoint === null ? null : prevPoint.x, prevPoint === null ? null : prevPoint.y, this.getCtxManager().getSettingsManager()));

                var point = {
                    x: x,
                    y: y,
                    size: o.points.size === null ? this.getCtxManager().getSettingsManager().getOptions().point.size : o.points.size,
                    thickness: o.points.thickness === null ? this.getCtxManager().getSettingsManager().getOptions().point.thickness : o.points.thickness,
                    color: o.points.color === null ? this.getCtxManager().getSettingsManager().getOptions().point.color : o.points.color,
                    hintlines: {
                        show: o.points.hintlines.show === null ? this.getCtxManager().getSettingsManager().getOptions().function.points.hintlines.show : o.points.hintlines.show,
                        color: o.points.hintlines.color === null ? this.getCtxManager().getSettingsManager().getOptions().function.points.hintlines.color : o.points.hintlines.color,
                        thickness: o.points.hintlines.thickness === null ? this.getCtxManager().getSettingsManager().getOptions().function.points.hintlines.show : o.points.hintlines.thickness,
                        dash: o.points.hintlines.dash === null ? this.getCtxManager().getSettingsManager().getOptions().function.points.hintlines.dash : o.points.hintlines.dash
                    },
                    label: {
                        render: o.points.labels.render === null ? this.getCtxManager().getSettingsManager().getOptions().point.label.render : o.points.labels.render,
                        font: o.points.labels.font === null ? this.getCtxManager().getSettingsManager().getOptions().point.label.font : o.points.labels.font,
                        color: o.points.labels.color === null ? this.getCtxManager().getSettingsManager().getOptions().point.label.color : o.points.labels.color,
                        padding: o.points.labels.padding === null ? this.getCtxManager().getSettingsManager().getOptions().point.label.padding : o.points.labels.padding
                    }
                };

                if (o.connectlines.show) {
                    if (prevPoint !== null) {
                        this.getCtxManager()
                            .setStartPoint(new smartGraphPointManager(point.x, point.y, false))
                            .setColor(o.connectlines.color)
                            .drawLine(new smartGraphPointManager(prevPoint.x, prevPoint.y, false), o.connectlines.thickness, o.connectlines.dash);
                    }
                }

                this.drawPoint(point);
                prevPoint = point;
            }
            else {
                prevPoint = null;
            }
        }

        return this;
    };




    var smartGraphAxisCreatorManager = function (ctxManagerInstance, axis, endPoint) {
        this._axis = axis;
        this._endPoint = endPoint;
        this._ctxManagerInstance = ctxManagerInstance;
    }

    smartGraphAxisCreatorManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphAxisCreatorManager.prototype.getSettingsManager = function () {
        return this.getCtxManager().getSettingsManager();
    };

    smartGraphAxisCreatorManager.prototype.getAxis = function () {
        return this._axis;
    }

    smartGraphAxisCreatorManager.prototype.getEndPoint = function () {
        return this._endPoint;
    }

    smartGraphAxisCreatorManager.prototype.isVisible = function () {
        if (this.getSettingsManager().getCenter().getX() < 0) {
            if (this.getAxis() === 'y' || this.getEndPoint().getX() === 0) {
                return false;
            }
        }

        if (this.getSettingsManager().getCenter().getX() > this.getSettingsManager().getWidth()) {
            if (this.getAxis() === 'y' || this.getEndPoint().getX() > 0) {
                return false;
            }
        }

        if (this.getSettingsManager().getCenter().getY() < 0) {
            if (this.getAxis() === 'x' || this.getEndPoint().getY() === 0) {
                return false;
            }
        }


        if (this.getSettingsManager().getCenter().getY() > this.getSettingsManager().getHeight()) {
            if (this.getAxis() === 'x' || this.getEndPoint().getY() > 0) {
                return false;
            }
        }

        return true;
    }

    smartGraphAxisCreatorManager.prototype.isNegative = function () {
        return this.getEndPoint().getX() < this.getSettingsManager().getCenter().getX() || this.getEndPoint().getY() > this.getSettingsManager().getCenter().getY();
    }

    smartGraphAxisCreatorManager.prototype.getLength = function () {
        return this.getEndPoint().getDistanceFrom(this.getSettingsManager().getCenter());
    }

    smartGraphAxisCreatorManager.prototype.getCountNecessaryTicks = function () {
        return Math.ceil(
            this.getLength() / (this.getSettingsManager().getModifiedTicksStep(this.getAxis()) * this.getSettingsManager().getScale())
        );
    }

    smartGraphAxisCreatorManager.prototype.getAxisOptions = function () {
        return this.getSettingsManager().getOptions().axises[this.getAxis()];
    }

    smartGraphAxisCreatorManager.prototype.construct = function () {
        if (this.isVisible()) {
            this.getCtxManager()
                .setColor(this.getAxisOptions().color)
                .setStartPoint(this.getSettingsManager().getCenter())
                .drawLine(this.getEndPoint(), this.getSettingsManager().getOptions().axises.thickness, []);

            var ticks = this.getCountNecessaryTicks();

            for (var i = 1; i < ticks; i += 1) {
                var value = i * this.getSettingsManager().getModifiedTicksStep(this.getAxis());



                if (this.isNegative()) {
                    value *= -1;
                }

                this.drawTick(value);
            }
        }

        return this;
    };

    smartGraphAxisCreatorManager.prototype.drawTick = function (value) {
        var tickCreator = new smartGraphTickManager(
            this.getSettingsManager(), this.getAxis(), value
        );

        this.getCtxManager()
            .setColor(this.getAxisOptions().ticks.color)
            .setStartPoint(tickCreator.getLineStartPoint())
            .drawLine(tickCreator.getLineEndPoint(), this.getSettingsManager().getOptions().axises.ticks.thickness, [])
            .setColor(this.getAxisOptions().ticks.titles.color)
            .setStartPoint(tickCreator.getTitlePoint())
            .drawText(
                this.getAxisOptions().ticks.titles.render(value, this),
                this.getSettingsManager().getOptions().axises.ticks.titles.font,
                $.fn.smartGraph.constants.axises[this.getAxis()].ticks.titles.align,
                $.fn.smartGraph.constants.axises[this.getAxis()].ticks.titles.baseline
            );
        

        return this;
    };

    smartGraphAxisCreatorManager.prototype.getOptimallyRoundedTick = function (value) {
        if (value === 0) {
            return 0;
        }

        var nextTick = this.isNegative() ? value - this.getSettingsManager().getModifiedTicksStep(this.getAxis()) : value + this.getSettingsManager().getModifiedTicksStep(this.getAxis());
        var digits = 1;
        var result = 0;

        while ((result = value.roundDigits(digits)) === 0 || result === nextTick.roundDigits(digits)) {
            digits += 2;
        }

        return result;
    }



    var smartGraphTickManager = function (settingsManagerInstance, axis, value) {
        this._axis = axis;
        this._value = value;
        this._settingsManagerInstance = settingsManagerInstance;
    };

    smartGraphTickManager.prototype.getSettingsManager = function () {
        return this._settingsManagerInstance;
    };

    smartGraphTickManager.prototype.getAxis = function () {
        return this._axis;
    };

    smartGraphTickManager.prototype.getValue = function () {
        return this._value;
    };

    smartGraphTickManager.prototype.getLineStartPoint = function () {
        if (this.getAxis() === 'x') {
            return new smartGraphPointManager(this.getValue(), -1 * this.getSettingsManager().getModifiedTickSize(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(-1 * this.getSettingsManager().getModifiedTickSize(), this.getValue(), false);
        }

        throw new Error("Invalid axis");
    };

    smartGraphTickManager.prototype.getLineEndPoint = function () {
        if (this.getAxis() === 'x') {
            return new smartGraphPointManager(this.getValue(), this.getSettingsManager().getModifiedTickSize(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(this.getSettingsManager().getModifiedTickSize(), this.getValue(), false);
        }

        throw new Error("Invalid axis");
    };

    smartGraphTickManager.prototype.getTitlePoint = function () {
        if (this.getAxis() === 'x') {
            return new smartGraphPointManager(this.getValue(), -1 * this.getSettingsManager().getModifiedTickTitleDistance(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(-1 * this.getSettingsManager().getModifiedTickTitleDistance(), this.getValue(), false);
        }

        throw new Error("Invalid axis");
    };




    var smartGraphPointManager = function (x, y, real) {
        this._x = x;
        this._y = y;
        this._real = real;
        this.color = null;
    }

    smartGraphPointManager.prototype.getDistanceFrom = function (point) {
        return Math.sqrt(Math.pow(point.getX() - this.getX(), 2) + Math.pow(point.getY() - this.getY(), 2));
    }

    smartGraphPointManager.prototype.equals = function (point) {
        return this.getDistanceFrom(point) < $.fn.smartGraph.constants.elementaryDistance;
    };

    smartGraphPointManager.prototype.getX = function () {
        return this._x;
    };

    smartGraphPointManager.prototype.getY = function () {
        return this._y;
    };

    smartGraphPointManager.prototype.isReal = function () {
        return this._real;
    };

    smartGraphPointManager.prototype.setReal = function (b) {
        this._real = b;
        return this;
    };



    var smartGraphSettingsManager = function (options, elem) {
        this._options = null;
        this._elem = elem;
        this._canvas = $('canvas', this._elem);
        this._width = this._canvas.outerWidth();
        this._height = this._canvas.outerHeight();
        this._defaultScale = 1;
        this.setOptions(options, false);
        this._modifierTickStep = {
            x: 1,
            y: 1
        }

        this._scale = this.getDefaultScale();
    };

    smartGraphSettingsManager.prototype.getElement = function () {
        return this._elem;
    };

    smartGraphSettingsManager.prototype.setOptions = function (options, update) {
        this._options = $.extend(true, {}, update ? this._options : $.fn.smartGraph.defaults, options);

        if (this._options.lines.color === null) {
            this._options.lines.color = this._options.color;
        }

        if (this._options.lines.color === null) {
            this._options.lines.color = this._options.color;
        }

        if (this._options.texts.color === null) {
            this._options.texts.color = this._options.color;
        }

        if (this._options.point.color === null) {
            this._options.point.color = this._options.color;
        }

        if (this._options.point.hintlines.color === null) {
            this._options.point.hintlines.color = this._options.lines.color;
        }

        if (this._options.point.label.color === null) {
            this._options.point.label.color = this._options.texts.color;
        }

        if (this._options.point.thickness === null) {
            this._options.point.thickness = this._options.lines.thickness;
        }

        if (this._options.point.hintlines.thickness === null) {
            this._options.point.hintlines.thickness = this._options.lines.thickness;
        }

        if (this._options.function.connectlines.color === null) {
            this._options.function.connectlines.color = this._options.lines.color;
        }

        if (this._options.function.connectlines.thickness === null) {
            this._options.function.connectlines.thickness = this._options.lines.thickness;
        }

        if (this._options.function.points.color === null) {
            this._options.function.points.color = this._options.point.color;
        }

        if (this._options.function.points.size === null) {
            this._options.function.points.size = this._options.point.size;
        }

        if (this._options.function.points.thickness === null) {
            this._options.function.points.thickness = this._options.point.thickness;
        }

        if (this._options.function.points.hintlines.color === null) {
            this._options.function.points.hintlines.color = this._options.point.hintlines.color;
        }

        if (this._options.function.points.hintlines.size === null) {
            this._options.function.points.hintlines.size = this._options.point.hintlines.size;
        }

        if (this._options.function.points.hintlines.thickness === null) {
            this._options.function.points.hintlines.thickness = this._options.point.hintlines.thickness;
        }

        if (this._options.function.points.hintlines.dash === null) {
            this._options.function.points.hintlines.dash = this._options.point.hintlines.dash;
        }

        if (this._options.function.points.labels.color === null) {
            this._options.function.points.labels.color = this._options.point.label.color;
        }

        if (this._options.function.points.labels.render === null) {
            this._options.function.points.labels.render = this._options.point.label.render;
        }

        if (this._options.function.points.labels.font === null) {
            this._options.function.points.labels.font = this._options.point.label.font;
        }

        if (this._options.function.points.labels.padding === null) {
            this._options.function.points.labels.padding = this._options.point.label.padding;
        }

        if (this._options.axises.thickness === null) {
            this._options.axises.thickness = this._options.lines.thickness;
        }

        if (this._options.axises.ticks.thickness === null) {
            this._options.axises.ticks.thickness = this._options.axises.thickness;
        }

        if (this._options.axises.color === null) {
            this._options.axises.color = this._options.lines.color;
        }

        if (this._options.axises.ticks.color === null) {
            this._options.axises.ticks.color = this._options.lines.color;
        }

        if (this._options.axises.ticks.titles.color === null) {
            this._options.axises.ticks.titles.color = this._options.texts.color;
        }

        if (this._options.axises.labels.color === null) {
            this._options.axises.labels.color = this._options.texts.color;
        }

        $.fn.smartGraph.constants.axises.names.forEach(axis => {
            if (this._options.axises[axis].ticks.step === null) {
                this._options.axises[axis].ticks.step = this._options.axises.ticks.step;
            }

            if (this._options.axises[axis].ticks.titles.render === null) {
                this._options.axises[axis].ticks.titles.render = this._options.axises.ticks.titles.render;
            }

            if (this._options.axises[axis].color === null) {
                this._options.axises[axis].color = this._options.axises.color;
            }

            if (this._options.axises[axis].ticks.color === null) {
                this._options.axises[axis].ticks.color = this._options.axises.ticks.color;
            }

            if (this._options.axises[axis].ticks.titles.color === null) {
                this._options.axises[axis].ticks.titles.color = this._options.axises.ticks.titles.color;
            }

            if (this._options.axises[axis].label.color === null) {
                this._options.axises[axis].label.color = this._options.axises.labels.color;
            }
        });

        if (this._options.function.step === null) {
            this._options.function.step = this._options.axises.x.ticks.step;
        }

        if (this._options.responsive.enable) {
            this.getElement().addClass($.fn.smartGraph.classes.responsive);
        }
        else {
            this.getElement().removeClass($.fn.smartGraph.classes.responsive);
        }

        return this.setDefaultScale();
    };

    smartGraphSettingsManager.prototype.getOptions = function () {
        return this._options;
    };

    smartGraphSettingsManager.prototype.getTicksDistance = function (axis) {
        return this.getScale() * (this.getOptions().axises[axis].ticks.step * this._modifierTickStep[axis]);
    }

    smartGraphSettingsManager.prototype.getModifiedTicksStep = function (axis) {
        if (this.getScale() === this.getDefaultScale()) {
            return this.getOptions().axises[axis].ticks.step;
        }

        if (this.getTicksDistance(axis) < $.fn.smartGraph.constants.readableTicksDistance[0]) {
            this._modifierTickStep[axis] = $.fn.smartGraph.constants.readableTicksDistance[1] / (this.getOptions().axises[axis].ticks.step * this.getScale());
        }
        else if (this.getTicksDistance(axis) > $.fn.smartGraph.constants.readableTicksDistance[1]) {
            this._modifierTickStep[axis] = $.fn.smartGraph.constants.readableTicksDistance[0] / (this.getOptions().axises[axis].ticks.step * this.getScale());
        }

        return this.getOptions().axises[axis].ticks.step * this._modifierTickStep[axis];
    }

    smartGraphSettingsManager.prototype.getModifiedTickSize = function () {
        return this.getOptions().axises.ticks.size / (2 * this.getScale());
    }

    smartGraphSettingsManager.prototype.getModifiedTickTitleDistance = function () {
        return (this.getOptions().axises.ticks.size + this.getOptions().axises.ticks.titles.padding) / (2 * this.getScale());
    }

    smartGraphSettingsManager.prototype.updateWidth = function () {
        this._width = this.getElement().outerWidth();
        this.getCanvas().attr('width', this._width);
        return this;
    };

    smartGraphSettingsManager.prototype.updateHeight = function () {
        this._height = this.getElement().outerWidth() / this.getOptions().responsive.ratio;
        this.getCanvas().attr('height', this._height);
        return this;
    };

    smartGraphSettingsManager.prototype.getWidth = function () {
        return this._width;
    };

    smartGraphSettingsManager.prototype.getHeight = function () {
        return this._height;
    };

    smartGraphSettingsManager.prototype.getCenter = function () {
        return new smartGraphPointManager(this.getWidth() / 2 + this.getOptions().move.x, this.getHeight() / 2 - this.getOptions().move.y, true);
    };

    smartGraphSettingsManager.prototype.getCanvas = function () {
        return this._canvas;
    };

    smartGraphSettingsManager.prototype.getScale = function () {
        return this._scale;
    };

    smartGraphSettingsManager.prototype.getDefaultScale = function () {
         return this._defaultScale;
    };

    smartGraphSettingsManager.prototype.setDefaultScale = function () {
        this._defaultScale = $.fn.smartGraph.constants.readableTicksDistance.reduce((a, b) => (a + b) / 2) / Math.min(this.getOptions().axises.x.ticks.step, this.getOptions().axises.y.ticks.step);
        return this;
    }

    smartGraphSettingsManager.prototype.increaseScale = function () {
        this._scale /= $.fn.smartGraph.constants.scaleElementaryChange;
        return this;
    };

    smartGraphSettingsManager.prototype.decreaseScale = function () {
        this._scale *= $.fn.smartGraph.constants.scaleElementaryChange;
        return this;
    };




    var smartGraphCtxManager = function (settingsManagerInstance) {
        this._settingsManagerInstance = settingsManagerInstance;
        this._ctx = this.getSettingsManager().getCanvas().get(0).getContext('2d');
        this._color = $.fn.smartGraph.defaults.color;
        this._startPoint = new smartGraphPointManager(0, 0, true);
    }

    smartGraphCtxManager.prototype.getSettingsManager = function () {
        return this._settingsManagerInstance;
    };

    smartGraphCtxManager.prototype.drawLine = function (endPoint, thickness, dash) {
        this.getCtx().beginPath();
        this.getCtx().moveTo(
            this.getRealX(this.getStartPoint()),
            this.getRealY(this.getStartPoint())
        );
        this.getCtx().lineTo(
            this.getRealX(endPoint),
            this.getRealY(endPoint)
        );

        this.getCtx().strokeStyle = this.getColor();
        this.getCtx().lineWidth = thickness;

        this.getCtx().setLineDash(dash);
        this.getCtx().stroke();

        return this;
    }

    smartGraphCtxManager.prototype.drawText = function (text, font, align, baseline) {
        this.getCtx().font = font;
        this.getCtx().fillStyle = this.getColor();
        this.getCtx().textAlign = align;
        this.getCtx().textBaseline = baseline;
        this.getCtx().fillText(
            text,
            this.getRealX(this.getStartPoint()),
            this.getRealY(this.getStartPoint())
        );

        return this;
    }

    smartGraphCtxManager.prototype.getCtx = function () {
        return this._ctx;
    };

    smartGraphCtxManager.prototype.setColor = function (color) {
        this._color = color;
        return this;
    };

    smartGraphCtxManager.prototype.getColor = function () {
        return this._color;
    };

    smartGraphCtxManager.prototype.setStartPoint = function (p) {
        this._startPoint = p;
        return this;
    };

    smartGraphCtxManager.prototype.getStartPoint = function () {
        return this._startPoint;
    };

    smartGraphCtxManager.prototype.clear = function () {
        this.getCtx().clearRect(0, 0, this.getSettingsManager().getWidth(), this.getSettingsManager().getHeight());
        return this;
    }

    smartGraphCtxManager.prototype.getRealX = function (p) {
        if (p.isReal()) {
            return p.getX();
        }

        return this.getSettingsManager().getCenter().getX() + p.getX() * this.getSettingsManager().getScale();
    };

    smartGraphCtxManager.prototype.getRealY = function (p) {
        if (p.isReal()) {
            return p.getY();
        }

        return this.getSettingsManager().getCenter().getY() - p.getY() * this.getSettingsManager().getScale();
    };




    $.fn.smartGraph = function (optionsOrCallbackName) {
        var isCallback = optionsOrCallbackName instanceof String || typeof optionsOrCallbackName === 'string';
        var smartGraphManagerInstance = PLUGIN + 'ManagerInstance';
        var callbackArguments = arguments;

        if (isCallback && optionsOrCallbackName === 'instance') {
            var manager = this.data(smartGraphManagerInstance);
            if (manager instanceof smartGraphManager) {
                return manager;
            }
            else $.error(PLUGIN + ' has not been initialized');
        }

        return this.each(function () {
            var $this = $(this);
            if (isCallback) {
                var manager = $this.data(smartGraphManagerInstance);
                if (manager instanceof smartGraphManager) {
                    if (manager[optionsOrCallbackName] instanceof Function) {
                        manager[optionsOrCallbackName].apply(manager, Array.prototype.slice.call(callbackArguments, 1));
                    }
                }
            }
            else if (!$this.data(smartGraphManagerInstance)) {
                $this.data(smartGraphManagerInstance, new smartGraphManager($this, optionsOrCallbackName));
            }
        });
    };

    $.fn.smartGraph.classes = {
        root: 'smart-graph',
        responsive: 'smart-graph-responsive',
        moving: 'smart-graph-moving'
    };

    $.fn.smartGraph.constants = {
        axises: {
            names: new Array('x', 'y'),
            x: {
                ticks: {
                    titles: {
                        baseline: 'top',
                        align: 'center'
                    }
                }
            },
            y: {
                ticks: {
                    titles: {
                        baseline: 'middle',
                        align: 'right'
                    }
                }
            }
        },
        elementaryDistance: 4,
        scaleElementaryChange: 0.9,
        readableTicksDistance: [40, 90],
    };

    $.fn.smartGraph.defaults = {
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
    };

    Number.prototype.roundDigits = function (digits) {
        var q = Math.pow(10, digits);
        return Math.round(this.valueOf() * q) / q;
    }
}));