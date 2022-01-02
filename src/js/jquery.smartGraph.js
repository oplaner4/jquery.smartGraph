/**
* jquery.smartGraph 1.3.0
* https://github.com/oplaner4/jquery.smartGraph
* by Ondrej Planer, oplaner4@gmail.com
*
*
* This library requires jQuery.js
* See the documentation before using this library please
* jquery.smartGraph.js may be freely distributed under the MIT license.
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
        this._settingsManagerInstance = new smartGraphSettingsManager(options, elem);
        this._ctxManagerInstance = new smartGraphCtxManager(this._settingsManagerInstance);
        this._creatorManagerInstance = new smartGraphCreatorManager(this._ctxManagerInstance);

        this._mousePosition = null;
        this._activeState = false;

        this.initWindowEvents().reconstruct().initSourceElementEvents();
    };

    smartGraphManager.prototype.initWindowEvents = function () {
        let self = this;

        $(window).on('resize', function () {
            if (self._settingsManagerInstance.getOptions().responsive.enable) {
                self._ctxManagerInstance.clear();
                self._settingsManagerInstance.updateWidth().updateHeight();
                self.create();
            }
        }).on('keydown', function (event) {
            if (!self._activeState) {
                return;
            }

            if (event.which === 38) {
                event.preventDefault();
                self.moveUp();
            }

            if (event.which === 40) {
                event.preventDefault();
                self.moveDown();
            }

            if (event.which === 37) {
                event.preventDefault();
                self.moveLeft();
            }

            if (event.which === 39) {
                event.preventDefault();
                self.moveRight();
            }

            if (event.which === 107) {
                event.preventDefault();
                self.zoomIn();
            }

            if (event.which === 109) {
                event.preventDefault();
                self.zoomOut();
            }
        }).trigger('resize');

        return self;
    };

    smartGraphManager.prototype.getPointByActualMousePosition = function () {
        return new smartGraphPointManager(
            (this._mousePosition.getX() - this._settingsManagerInstance.getCenter().getX())
            / this._settingsManagerInstance.getScale(),
            (this._settingsManagerInstance.getCenter().getY()
                - this._mousePosition.getY()) / this._settingsManagerInstance.getScale(),
            false
        );
    };

    smartGraphManager.prototype.initSourceElementEvents = function () {
        let self = this;

        let mouseMovingState = false;
        let movingStateTimeout = null;

        self._settingsManagerInstance.getElement()
            .addClass($.fn.smartGraph.classes.root)
            .on('mousemove touchmove', function (e) {
                let offset = $(this).offset();
                let rect = e;

                if (e.touches) {
                    rect = e.touches[0];
                }

                if (mouseMovingState) {
                    self.setOptions({
                        move: {
                            x: self._settingsManagerInstance.getOptions().move.x
                                - self._mousePosition.getX() - offset.left + rect.clientX,
                            y: self._settingsManagerInstance.getOptions().move.y
                                + self._mousePosition.getY() + offset.top - rect.clientY
                                - $(window).scrollTop(),
                        }
                    });
                }

                self._mousePosition = new smartGraphPointManager(
                    rect.clientX - offset.left,
                    rect.clientY - offset.top + $(window).scrollTop(), true);

            }).on('mouseup touchend', function () {
                clearTimeout(movingStateTimeout);
                this.classList.remove($.fn.smartGraph.classes.moving);
                mouseMovingState = false;
            }).on('mouseover mouseout touchstart touchend', function () {
                mouseMovingState = false;
                self._mousePosition = self._settingsManagerInstance.getCenter();
            }).on('mousedown touchstart', function (e) {
                e.preventDefault();
                let $this = $(this);

                movingStateTimeout = setTimeout(function () {
                    mouseMovingState = true;
                    $this.addClass($.fn.smartGraph.classes.moving);
                }, 100);

                $this.trigger(PLUGIN + '.click', [
                    self._settingsManagerInstance,
                    self.getPointByActualMousePosition(),
                ]);
            })
            .on('mouseover touchstart', function () {
                self._activeState = true;
            }).on('mouseout touchend', function () {
                self._activeState = false;
            })
            .on('mousewheel DOMMouseScroll', function (e) {
                e.preventDefault();
                if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                    self.zoomIn();
                }
                else {
                    self.zoomOut();
                }
            }).trigger(PLUGIN + '.init', [self._settingsManagerInstance]);

        return self;
    };

    smartGraphManager.prototype.processData = function () {
        let self = this;

        self._settingsManagerInstance.getOptions().data.points.forEach(function (p) {
            self._creatorManagerInstance.drawPoint(p);
        });

        self._settingsManagerInstance.getOptions().data.functions.forEach(function (f) {
            self._creatorManagerInstance.drawFunction(f);
        });

        return self;
    };

    smartGraphManager.prototype.create = function () {
        this.processData()._creatorManagerInstance.constructAxises();
        return this;
    };

    smartGraphManager.prototype.reconstruct = function () {
        this._ctxManagerInstance.clear();
        return this.create();
    };

    smartGraphManager.prototype.setOptions = function (options) {
        this._settingsManagerInstance.setOptions(options, true);
        return this.reconstruct();
    };

    smartGraphManager.prototype.updateData = function (data) {
        return this.setOptions({
            data: data
        });
    };

    smartGraphManager.prototype.addData = function (data) {
        let result = this._settingsManagerInstance.getOptions().data;

        if (data.hasOwnProperty('points')) {
            data.points.forEach(function (p) {
                result.points.push(p);
            });
        }

        if (data.hasOwnProperty('functions')) {
            data.functions.forEach(function (f) {
                result.functions.push(f);
            });
        }

        return this.updateData(result);
    };

    smartGraphManager.prototype.moveRight = function () {
        return this.setOptions({
            move: {
                x: this._settingsManagerInstance.getOptions().move.x
                    - this._settingsManagerInstance.getTicksDistance('x')
            }
        });
    };

    smartGraphManager.prototype.moveLeft = function () {
        return this.setOptions({
            move: {
                x: this._settingsManagerInstance.getOptions().move.x
                    + this._settingsManagerInstance.getTicksDistance('x')
            }
        });
    };

    smartGraphManager.prototype.moveUp = function () {
        return this.setOptions({
            move: {
                y: this._settingsManagerInstance.getOptions().move.y
                    - this._settingsManagerInstance.getTicksDistance('y')
            }
        });
    };

    smartGraphManager.prototype.moveDown = function () {
        return this.setOptions({
            move: {
                y: this._settingsManagerInstance.getOptions().move.y
                    + this._settingsManagerInstance.getTicksDistance('y')
            }
        });
    };

    smartGraphManager.prototype.zoomIn = function () {
        this._settingsManagerInstance.increaseScale();
        return this.reconstruct();
    };

    smartGraphManager.prototype.zoomOut = function () {
        this._settingsManagerInstance.decreaseScale();
        return this.reconstruct();
    };

    smartGraphManager.throwTypeError = function (property, object) {
        throw new TypeError('Property "' + property + '" is not specified' +
            ' or is of wrong type at "' + object + '"'
        );
    };

    smartGraphManager.throwRangeError = function (property, object) {
        throw new RangeError('Property "' + property + '" seems invalid' +
            ' at "' + object + '"'
        );
    };



    var smartGraphCreatorManager = function (ctxManagerInstance) {
        this._ctxManagerInstance = ctxManagerInstance;
    };

    smartGraphCreatorManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphCreatorManager.prototype.getSettingsManager = function () {
        return this.getCtxManager().getSettingsManager();
    };

    smartGraphCreatorManager.prototype.drawAxisesLabels = function () {
        let options = this.getSettingsManager().getOptions();

        this.getCtxManager()
            .setColor(options.axises.x.label.color)
            .setStartPoint(
                new smartGraphPointManager(
                    this.getSettingsManager().getWidth(),
                    this.getSettingsManager().getCenter().getY()
                    + options.axises.x.label.padding,
                    true
                )
            )
            .drawText(
                options.axises.x.label.caption, options.axises.labels.font,
                'right', 'top'
            )
            .setColor(options.axises.y.label.color)
            .setStartPoint(
                new smartGraphPointManager(this.getSettingsManager().getCenter().getX()
                    - options.axises.y.label.padding, 0, true)
            ).drawText(
                options.axises.y.label.caption,
                options.axises.labels.font,
                'right', 'top'
            );

        return this;
    };

    smartGraphCreatorManager.prototype.getAxisXNegativeCreatorManager = function () {
        return new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'x',
            new smartGraphPointManager(
                0, this.getSettingsManager().getCenter().getY(), true)
        );
    };

    smartGraphCreatorManager.prototype.getAxisXPositiveCreatorManager = function () {
        return new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'x',
            new smartGraphPointManager(
                this.getSettingsManager().getWidth(),
                this.getSettingsManager().getCenter().getY(), true)
        );
    };

    smartGraphCreatorManager.prototype.constructAxises = function () {
        this.drawAxisesLabels().drawCenterTitle()
            .getAxisXNegativeCreatorManager().construct();
        this.getAxisXPositiveCreatorManager().construct();
        new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'y',
            new smartGraphPointManager(
                this.getSettingsManager().getCenter().getX(), 0, true)
        ).construct();
        new smartGraphAxisCreatorManager(
            this.getCtxManager(),
            'y',
            new smartGraphPointManager(
                this.getSettingsManager().getCenter().getX(),
                this.getSettingsManager().getHeight(), true)
        ).construct();
        return this;
    };

    smartGraphCreatorManager.prototype.drawCenterTitle = function () {
        let options = this.getSettingsManager().getOptions();

        this.getCtxManager()
            .setColor(options.axises.ticks.titles.color)
            .setStartPoint(
                new smartGraphPointManager(
                    -this.getSettingsManager().getModifiedTickTitleDistance(),
                    -1 * this.getSettingsManager().getModifiedTickTitleDistance(),
                    false)
            )
            .drawText(
                options.axises.ticks.titles.render(
                    0, this.getAxisXNegativeCreatorManager()),
                options.axises.ticks.titles.font,
                'right',
                'top'
            );

        return this;
    };

    smartGraphCreatorManager.prototype.drawFunction = function (props) {
        new smartGraphDrawFunctionManager(this.getCtxManager(), props,
            this.getAxisXNegativeCreatorManager().getLength(),
            this.getAxisXPositiveCreatorManager().getLength()).draw();
        return this;
    };

    smartGraphCreatorManager.prototype.drawPoint = function (props) {
        new smartGraphDrawPointManager(this.getCtxManager(), props, false).draw();
        return this;
    };



    var smartGraphDrawFunctionManager = function (
        ctxManagerInstance, initProps, xNegativeAxisLength, xPositiveAxisLength) {
        this._ctxManagerInstance = ctxManagerInstance;
        this._actualExtendedProps = $.extend(
            true, {},
            this._ctxManagerInstance.getSettingsManager().getOptions().function,
            initProps);

        this.checkCompulsoryProps();

        this._xNegativeAxisLength = xNegativeAxisLength;
        this._xPositiveAxisLength = xPositiveAxisLength;

        this._lastPointExtendedO = null;
        this._drawn = false;

        this._modifier = this._actualExtendedProps.modifier;

        this._step = this._actualExtendedProps.step;
        this._intervalStart = this._actualExtendedProps.interval[0];
        this._intervalEnd = this._actualExtendedProps.interval[1];
        this._relation = this._actualExtendedProps.relation;
    };

    smartGraphDrawFunctionManager.prototype.checkCompulsoryProps = function () {
        if (typeof this._actualExtendedProps.relation !== 'function') {
            smartGraphManager.throwTypeError('relation', 'options.data.functions[i]');
        }

        if (typeof this._actualExtendedProps.interval !== 'object'
            || typeof this._actualExtendedProps.interval.length === 'undefined'
        ) {
            smartGraphManager.throwTypeError('interval', 'options.data.functions[i]');
        }

        if (this._actualExtendedProps.interval.length < 2) {
            smartGraphManager.throwRangeError('interval', 'options.data.functions[i]');
        }

        if (typeof this._actualExtendedProps.interval[0] !== 'number'
            || typeof this._actualExtendedProps.interval[1] !== 'number'
        ) {
            smartGraphManager.throwTypeError('interval', 'options.data.functions[i]');
        }

        if (this._actualExtendedProps.interval[0] >
                this._actualExtendedProps.interval[1]) {
            smartGraphManager.throwRangeError('interval', 'options.data.functions[i]');
        }
    }

    smartGraphDrawFunctionManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphDrawFunctionManager.prototype.isDrawn = function () {
        return this._drawn;
    };

    smartGraphDrawFunctionManager.prototype.getIntervalLowerBound = function () {
        return Math.max(
            -1 * this._xNegativeAxisLength
            / this.getCtxManager().getSettingsManager().getScale(),
            this._intervalStart
        );
    };

    smartGraphDrawFunctionManager.prototype.getIntervalUpperBound = function () {
        return Math.min(
            this._xPositiveAxisLength
            / this.getCtxManager().getSettingsManager().getScale(),
            this._intervalEnd);
    };

    smartGraphDrawFunctionManager.prototype.draw = function () {
        if (this.isDrawn()) {
            return this;
        }

        let intervalUpperBound = this.getIntervalUpperBound();
        let intervalLowerBound = this.getIntervalLowerBound();

        for (let x = intervalLowerBound; x < intervalUpperBound; x += this._step) {
            this.drawNextPoint(x);
        }

        this.drawNextPoint(intervalUpperBound);

        this._drawn = true;
        return this;
    };

    smartGraphDrawFunctionManager.prototype.drawNextPoint = function (x) {
        let y = this._relation(x);

        if (y === Infinity || y === -Infinity || y === NaN) {
            this._lastPointExtendedO = null;
            return this;
        }

        this._actualExtendedProps = $.extend(
            true, {}, this._actualExtendedProps,
            this._modifier(
                x, y, this._lastPointExtendedO === null ? null : this._lastPointExtendedO.x,
                this._lastPointExtendedO === null ? null : this._lastPointExtendedO.y,
                this.getCtxManager().getSettingsManager())
        );

        let pointExtendedO = this.getExtendedPointO(x, y, this._actualExtendedProps);

        this.drawConnectline(pointExtendedO);
        new smartGraphDrawPointManager(this.getCtxManager(), pointExtendedO, true).draw();

        this._lastPointExtendedO = pointExtendedO;
        return this;
    };

    smartGraphDrawFunctionManager.prototype.drawConnectline = function (pointExtendedO) {
        if (this._actualExtendedProps.connectlines.show && this._lastPointExtendedO !== null) {
            this.getCtxManager()
                .setStartPoint(new smartGraphPointManager(pointExtendedO.x, pointExtendedO.y, false))
                .setColor(this._actualExtendedProps.connectlines.color)
                .drawLine(new smartGraphPointManager(
                    this._lastPointExtendedO.x, this._lastPointExtendedO.y, false),
                    this._actualExtendedProps.connectlines.thickness,
                    this._actualExtendedProps.connectlines.dash);
        }

        return this;
    };

    smartGraphDrawFunctionManager.prototype.getExtendedPointO = function (x, y) {
        let options = this.getCtxManager().getSettingsManager().getOptions();

        return {
            x: x,
            y: y,
            size: this._actualExtendedProps.points.size === null ? options.point.size
                : this._actualExtendedProps.points.size,
            thickness: this._actualExtendedProps.points.thickness === null
                ? options.point.thickness
                : this._actualExtendedProps.points.thickness,
            color: this._actualExtendedProps.points.color === null
                ? options.point.color
                : this._actualExtendedProps.points.color,
            hintlines: {
                show: this._actualExtendedProps.points.hintlines.show === null
                    ? options.function.points.hintlines.show
                    : this._actualExtendedProps.points.hintlines.show,
                color: this._actualExtendedProps.points.hintlines.color === null
                    ? options.function.points.hintlines.color
                    : this._actualExtendedProps.points.hintlines.color,
                thickness: this._actualExtendedProps.points.hintlines.thickness === null
                    ? options.function.points.hintlines.show
                    : this._actualExtendedProps.points.hintlines.thickness,
                dash: this._actualExtendedProps.points.hintlines.dash === null
                    ? options.function.points.hintlines.dash
                    : this._actualExtendedProps.points.hintlines.dash
            },
            label: {
                render: this._actualExtendedProps.points.labels.render === null
                    ? options.point.label.render
                    : this._actualExtendedProps.points.labels.render,
                font: this._actualExtendedProps.points.labels.font === null
                    ? options.point.label.font
                    : this._actualExtendedProps.points.labels.font,
                color: this._actualExtendedProps.points.labels.color === null
                    ? options.point.label.color
                    : this._actualExtendedProps.points.labels.color,
                padding: this._actualExtendedProps.points.labels.padding === null
                    ? options.point.label.padding
                    : this._actualExtendedProps.points.labels.padding
            }
        };
    };



    var smartGraphDrawPointManager = function (
            ctxManagerInstance, props, arePropsExtended) {
        this._ctxManagerInstance = ctxManagerInstance;
        this._extendedProps = arePropsExtended ? props : $.extend(
            true, {},
            this._ctxManagerInstance.getSettingsManager().getOptions().point, props);

        if (typeof this._extendedProps.x !== 'number') {
            smartGraphManager.throwTypeError('x', 'options.data.points[i]');
        }

        if (typeof this._extendedProps.y !== 'number') {
            smartGraphManager.throwTypeError('y', 'options.data.points[i]');
        }

        this._drawn = false;
    };

    smartGraphDrawPointManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphDrawPointManager.prototype.isDrawn = function () {
        return this._drawn;
    };

    smartGraphDrawPointManager.prototype.draw = function () {
        if (this.isDrawn()) {
            return this;
        }

        let d = this._extendedProps.size / (2 * this.getCtxManager().getSettingsManager().getScale());

        this.getCtxManager()
            .setColor(this._extendedProps.color)
            .setStartPoint(new smartGraphPointManager(this._extendedProps.x - d, this._extendedProps.y, false))
            .drawLine(new smartGraphPointManager(
                this._extendedProps.x + d, this._extendedProps.y, false), this._extendedProps.thickness, [])
            .setStartPoint(new smartGraphPointManager(this._extendedProps.x, this._extendedProps.y - d, false))
            .drawLine(new smartGraphPointManager(
                this._extendedProps.x, this._extendedProps.y + d, false), this._extendedProps.thickness, []);

        this._drawn = true;
        return this.drawHintline().drawLabel();
    };

    smartGraphDrawPointManager.prototype.drawHintline = function () {
        if (this._extendedProps.hintlines.show) {
            this.getCtxManager()
                .setColor(this._extendedProps.hintlines.color)
                .setStartPoint(new smartGraphPointManager(this._extendedProps.x, this._extendedProps.y, false))
                .drawLine(new smartGraphPointManager(0, this._extendedProps.y, false),
                    this._extendedProps.hintlines.thickness, this._extendedProps.hintlines.dash)
                .drawLine(new smartGraphPointManager(this._extendedProps.x, 0, false),
                    this._extendedProps.hintlines.thickness, this._extendedProps.hintlines.dash)
        }

        return this;
    };

    smartGraphDrawPointManager.prototype.drawLabel = function () {
        this.getCtxManager()
            .setColor(this._extendedProps.label.color)
            .setStartPoint(
                new smartGraphPointManager(
                    this._extendedProps.x + (this._extendedProps.x > 0 ? 1 : -1) * this._extendedProps.label.padding /
                    this.getCtxManager().getSettingsManager().getScale(),
                    this._extendedProps.y + (this._extendedProps.y > 0 ? 1 : -1) * this._extendedProps.label.padding /
                    this.getCtxManager().getSettingsManager().getScale(),
                    false
                )
            ).drawText(
                this._extendedProps.label.render(this._extendedProps.x, this._extendedProps.y,
                    this.getCtxManager().getSettingsManager()),
                this._extendedProps.label.font,
                this._extendedProps.x < 0 ? 'right' : 'left',
                this._extendedProps.y < 0 ? 'top' : 'bottom'
            );


        return this;
    };



    var smartGraphAxisCreatorManager = function (ctxManagerInstance, axis, endPoint) {
        this._axis = axis;
        this._endPoint = endPoint;
        this._ctxManagerInstance = ctxManagerInstance;
    };

    smartGraphAxisCreatorManager.prototype.getCtxManager = function () {
        return this._ctxManagerInstance;
    };

    smartGraphAxisCreatorManager.prototype.getSettingsManager = function () {
        return this.getCtxManager().getSettingsManager();
    };

    smartGraphAxisCreatorManager.prototype.getAxis = function () {
        return this._axis;
    };

    smartGraphAxisCreatorManager.prototype.getEndPoint = function () {
        return this._endPoint;
    };

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
    };

    smartGraphAxisCreatorManager.prototype.isNegative = function () {
        return this.getEndPoint().getX() < this.getSettingsManager().getCenter().getX()
            || this.getEndPoint().getY() > this.getSettingsManager().getCenter().getY();
    };

    smartGraphAxisCreatorManager.prototype.getLength = function () {
        return this.getEndPoint().getDistanceFrom(this.getSettingsManager().getCenter());
    };

    smartGraphAxisCreatorManager.prototype.getCountNecessaryTicks = function () {
        return Math.ceil(
            this.getLength() / (this.getSettingsManager().getModifiedTicksStep(this.getAxis())
                * this.getSettingsManager().getScale())
        );
    };

    smartGraphAxisCreatorManager.prototype.getAxisOptions = function () {
        return this.getSettingsManager().getOptions().axises[this.getAxis()];
    };

    smartGraphAxisCreatorManager.prototype.construct = function () {
        if (this.isVisible()) {
            this.getCtxManager()
                .setColor(this.getAxisOptions().color)
                .setStartPoint(this.getSettingsManager().getCenter())
                .drawLine(this.getEndPoint(), this.getSettingsManager().getOptions().axises.thickness, []);

            let ticks = this.getCountNecessaryTicks();

            for (let i = 1; i < ticks; i += 1) {
                let value = i * this.getSettingsManager().getModifiedTicksStep(this.getAxis());

                if (this.isNegative()) {
                    value *= -1;
                }

                this.drawTick(value);
            }
        }

        return this;
    };

    smartGraphAxisCreatorManager.prototype.drawTick = function (value) {
        let tickCreator = new smartGraphTickManager(
            this.getSettingsManager(), this.getAxis(), value
        );

        this.getCtxManager()
            .setColor(this.getAxisOptions().ticks.color)
            .setStartPoint(tickCreator.getLineStartPoint())
            .drawLine(tickCreator.getLineEndPoint(),
                this.getSettingsManager().getOptions().axises.ticks.thickness, [])
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

        let nextTick = this.isNegative() ? value - this.getSettingsManager().getModifiedTicksStep(
            this.getAxis()) : value + this.getSettingsManager().getModifiedTicksStep(this.getAxis());
        let digits = 1;
        let result = 0;

        while ((result = value.roundDigits(digits)) === 0 || result === nextTick.roundDigits(digits)) {
            digits += 2;
        }

        return result;
    };



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
            return new smartGraphPointManager(
                this.getValue(), -1 * this.getSettingsManager().getModifiedTickSize(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(
                -1 * this.getSettingsManager().getModifiedTickSize(), this.getValue(), false);
        }

        return new smartGraphPointManager(0, 0, true);
    };

    smartGraphTickManager.prototype.getLineEndPoint = function () {
        if (this.getAxis() === 'x') {
            return new smartGraphPointManager(
                this.getValue(), this.getSettingsManager().getModifiedTickSize(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(
                this.getSettingsManager().getModifiedTickSize(), this.getValue(), false);
        }

        return new smartGraphPointManager(0, 0, true);
    };

    smartGraphTickManager.prototype.getTitlePoint = function () {
        if (this.getAxis() === 'x') {
            return new smartGraphPointManager(
                this.getValue(), -1 * this.getSettingsManager().getModifiedTickTitleDistance(), false);
        }

        if (this.getAxis() === 'y') {
            return new smartGraphPointManager(
                -1 * this.getSettingsManager().getModifiedTickTitleDistance(), this.getValue(), false);
        }

        return new smartGraphPointManager(0, 0, true);
    };




    var smartGraphPointManager = function (x, y, real) {
        this._x = x;
        this._y = y;
        this._real = real;
    };

    smartGraphPointManager.prototype.getDistanceFrom = function (anotherPointManager) {
        return Math.sqrt(Math.pow(anotherPointManager.getX() - this.getX(), 2) + Math.pow(anotherPointManager.getY() - this.getY(), 2));
    };

    smartGraphPointManager.prototype.equals = function (anotherPointManager) {
        return this.getDistanceFrom(anotherPointManager) < $.fn.smartGraph.constants.elementaryDistance;
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
        let self = this;

        self._options = $.extend(true, {},
            update ? self._options : $.fn.smartGraph.defaults, options);

        if (self._options.lines.color === null) {
            self._options.lines.color = self._options.color;
        }

        if (self._options.lines.color === null) {
            self._options.lines.color = self._options.color;
        }

        if (self._options.texts.color === null) {
            self._options.texts.color = self._options.color;
        }

        if (self._options.point.color === null) {
            self._options.point.color = self._options.color;
        }

        if (self._options.point.hintlines.color === null) {
            self._options.point.hintlines.color = self._options.lines.color;
        }

        if (self._options.point.label.color === null) {
            self._options.point.label.color = self._options.texts.color;
        }

        if (self._options.point.thickness === null) {
            self._options.point.thickness = self._options.lines.thickness;
        }

        if (self._options.point.hintlines.thickness === null) {
            self._options.point.hintlines.thickness = self._options.lines.thickness;
        }

        if (self._options.function.connectlines.color === null) {
            self._options.function.connectlines.color = self._options.lines.color;
        }

        if (self._options.function.connectlines.thickness === null) {
            self._options.function.connectlines.thickness = self._options.lines.thickness;
        }

        if (self._options.function.points.color === null) {
            self._options.function.points.color = self._options.point.color;
        }

        if (self._options.function.points.size === null) {
            self._options.function.points.size = self._options.point.size;
        }

        if (self._options.function.points.thickness === null) {
            self._options.function.points.thickness = self._options.point.thickness;
        }

        if (self._options.function.points.hintlines.color === null) {
            self._options.function.points.hintlines.color = self._options.point.hintlines.color;
        }

        if (self._options.function.points.hintlines.size === null) {
            self._options.function.points.hintlines.size = self._options.point.hintlines.size;
        }

        if (self._options.function.points.hintlines.thickness === null) {
            self._options.function.points.hintlines.thickness = self._options.point.hintlines.thickness;
        }

        if (self._options.function.points.hintlines.dash === null) {
            self._options.function.points.hintlines.dash = self._options.point.hintlines.dash;
        }

        if (self._options.function.points.labels.color === null) {
            self._options.function.points.labels.color = self._options.point.label.color;
        }

        if (self._options.function.points.labels.render === null) {
            self._options.function.points.labels.render = self._options.point.label.render;
        }

        if (self._options.function.points.labels.font === null) {
            self._options.function.points.labels.font = self._options.point.label.font;
        }

        if (self._options.function.points.labels.padding === null) {
            self._options.function.points.labels.padding = self._options.point.label.padding;
        }

        if (self._options.axises.thickness === null) {
            self._options.axises.thickness = self._options.lines.thickness;
        }

        if (self._options.axises.ticks.thickness === null) {
            self._options.axises.ticks.thickness = self._options.axises.thickness;
        }

        if (self._options.axises.color === null) {
            self._options.axises.color = self._options.lines.color;
        }

        if (self._options.axises.ticks.color === null) {
            self._options.axises.ticks.color = self._options.lines.color;
        }

        if (self._options.axises.ticks.titles.color === null) {
            self._options.axises.ticks.titles.color = self._options.texts.color;
        }

        if (self._options.axises.labels.color === null) {
            self._options.axises.labels.color = self._options.texts.color;
        }

        $.fn.smartGraph.constants.axises.names.forEach(function (axis) {
            if (self._options.axises[axis].ticks.step === null) {
                self._options.axises[axis].ticks.step = self._options.axises.ticks.step;
            }

            if (self._options.axises[axis].ticks.titles.render === null) {
                self._options.axises[axis].ticks.titles.render = self._options.axises.ticks.titles.render;
            }

            if (self._options.axises[axis].color === null) {
                self._options.axises[axis].color = self._options.axises.color;
            }

            if (self._options.axises[axis].ticks.color === null) {
                self._options.axises[axis].ticks.color = self._options.axises.ticks.color;
            }

            if (self._options.axises[axis].ticks.titles.color === null) {
                self._options.axises[axis].ticks.titles.color = self._options.axises.ticks.titles.color;
            }

            if (self._options.axises[axis].label.color === null) {
                self._options.axises[axis].label.color = self._options.axises.labels.color;
            }
        });

        if (self._options.function.step === null) {
            self._options.function.step = self._options.axises.x.ticks.step;
        }

        if (self._options.responsive.enable) {
            self.getElement().addClass($.fn.smartGraph.classes.responsive);
        }
        else {
            self.getElement().removeClass($.fn.smartGraph.classes.responsive);
        }

        return self.setDefaultScale();
    };

    smartGraphSettingsManager.prototype.getOptions = function () {
        return this._options;
    };

    smartGraphSettingsManager.prototype.getTicksDistance = function (axis) {
        return this.getScale() * (this.getOptions().axises[axis].ticks.step * this._modifierTickStep[axis]);
    };

    smartGraphSettingsManager.prototype.getModifiedTicksStep = function (axis) {
        if (this.getScale() === this.getDefaultScale()) {
            return this.getOptions().axises[axis].ticks.step;
        }

        if (this.getTicksDistance(axis) < $.fn.smartGraph.constants.readableTicksDistance[0]) {
            this._modifierTickStep[axis] = $.fn.smartGraph.constants.readableTicksDistance[1] /
                (this.getOptions().axises[axis].ticks.step * this.getScale());
        }
        else if (this.getTicksDistance(axis) > $.fn.smartGraph.constants.readableTicksDistance[1]) {
            this._modifierTickStep[axis] = $.fn.smartGraph.constants.readableTicksDistance[0] /
                (this.getOptions().axises[axis].ticks.step * this.getScale());
        }

        return this.getOptions().axises[axis].ticks.step * this._modifierTickStep[axis];
    };

    smartGraphSettingsManager.prototype.getModifiedTickSize = function () {
        return this.getOptions().axises.ticks.size / (2 * this.getScale());
    };

    smartGraphSettingsManager.prototype.getModifiedTickTitleDistance = function () {
        return (this.getOptions().axises.ticks.size + this.getOptions().axises.ticks.titles.padding) /
            (2 * this.getScale());
    };

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
        return new smartGraphPointManager(this.getWidth() /
            2 + this.getOptions().move.x, this.getHeight() / 2 - this.getOptions().move.y, true);
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
        this._defaultScale = $.fn.smartGraph.constants.readableTicksDistance.reduce(function (a, b) {
            return (a + b) / 2;
        }) / Math.min(this.getOptions().axises.x.ticks.step, this.getOptions().axises.y.ticks.step);
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
    };

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
    };

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
    };

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
        this.getCtx().clearRect(
            0, 0, this.getSettingsManager().getWidth(),
            this.getSettingsManager().getHeight());
        return this;
    };

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
        let isCallback = optionsOrCallbackName instanceof String || typeof optionsOrCallbackName === 'string';
        let smartGraphManagerInstance = PLUGIN + 'ManagerInstance';
        let callbackArguments = arguments;

        if (isCallback && optionsOrCallbackName === 'instance') {
            let manager = this.data(smartGraphManagerInstance);
            if (manager instanceof smartGraphManager) {
                return manager;
            }
            else $.error(PLUGIN + ' has not been initialized');
        }

        return this.each(function () {
            let $this = $(this);
            if (isCallback) {
                let manager = $this.data(smartGraphManagerInstance);
                if (manager instanceof smartGraphManager) {
                    if (manager[optionsOrCallbackName] instanceof Function) {
                        manager[optionsOrCallbackName].apply(
                            manager, Array.prototype.slice.call(callbackArguments, 1));
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
        moving: 'smart-graph-moving',
    };

    $.fn.smartGraph.constants = {
        axises: {
            names: new Array('x', 'y'),
            x: {
                ticks: {
                    titles: {
                        baseline: 'top',
                        align: 'center',
                    },
                },
            },
            y: {
                ticks: {
                    titles: {
                        baseline: 'middle',
                        align: 'right',
                    },
                },
            },
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
                    },
                },
            },
            labels: {
                font: '20px Calibri',
                color: null, /* inherits from texts.color */
            },
            x: {
                color: null, /* inherits from axises.color */
                label: {
                    caption: 'x',
                    color: null,  /* inherits from axises.labels.color */
                    padding: 20,
                },
                ticks: {
                    step: null, /* inherits from axises.ticks.step */
                    color: null, /* inherits from axises.color */
                    titles: {
                        color: null, /* inherits from axises.ticks..titles.color */
                        render: null, /* inherits from axises.ticks.titles.render */
                    },
                },
            },
            y: {
                color: null, /* inherits from axises.color */
                label: {
                    caption: 'y',
                    color: null, /* inherits from axises.labels.color */
                    padding: 20,
                },
                ticks: {
                    step: null, /* inherits from axises.ticks.step */
                    color: null, /* inherits from axises.color */
                    titles: {
                        color: null, /* inherits from axises.ticks.titles.color */
                        render: null, /* inherits from axises.ticks.titles.render */
                    },
                },
            },
        },
        data: {
            points: [],
            functions: [],
        },
        point: {
            size: 10,
            thickness: 2,
            color: null, /* inherits from color */
            hintlines: {
                show: false,
                color: null, /* inherits from lines.color */
                thickness: null, /* inherits from lines.thickness */
                dash: [2, 2],
            },
            label: {
                font: '13px Calibri',
                color: null, /* inherits from texts.color */
                padding: 7,
                render: function (x, y) {
                    return '(' + x.roundDigits(2) + ', ' + y.roundDigits(2) + ')';
                },
            },
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
                dash: [],
            },
            points: {
                color: null, /* inherits from point.color */
                size: null, /* inherits from point.size */
                thickness: null, /* inherits from point.thickness */
                hintlines: {
                    show: null, /* inherits from point.hintlines.show */
                    color: null, /* inherits from point.hintlines.color */
                    thickness: null, /* inherits from point.hintlines.thickness */
                    dash: null, /* inherits from point.hintlines.dash */
                },
                labels: {
                    font: null, /* inherits from point.label.font */
                    color: null, /* inherits from point.label.color */
                    padding: null, /* inherits from point.label.padding */
                    render: function () {
                        return '';
                    },
                },
            },
        },
        lines: {
            color: null, /* inherits from color */
            thickness: 1,
        },
        texts: {
            color: null, /* inherits from color */
        },
        move: {
            x: 0,
            y: 0,
        },
        responsive: {
            enable: true,
            ratio: 16 / 9,
        },
    };

    Number.prototype.roundDigits = function (digits) {
        let q = Math.pow(10, digits);
        return Math.round(this.valueOf() * q) / q;
    };
}));