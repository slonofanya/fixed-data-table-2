/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableBufferedRows
 * @typechecks
 */

import React from 'React';
import FixedDataTableRowBuffer from 'FixedDataTableRowBuffer';
import FixedDataTableRow from 'FixedDataTableRow';

import cx from 'cx';
import emptyFunction from 'emptyFunction';
import joinClasses from 'joinClasses';
import FixedDataTableTranslateDOMPosition from 'FixedDataTableTranslateDOMPosition';

var {PropTypes} = React;

var FixedDataTableBufferedRows = React.createClass({

  propTypes: {
    isScrolling: PropTypes.bool,
    defaultRowHeight: PropTypes.number.isRequired,
    firstRowIndex: PropTypes.number.isRequired,
    firstRowOffset: PropTypes.number.isRequired,
    fixedColumns: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    maxScrollX: PropTypes.number.isRequired,
    offsetTop: PropTypes.number.isRequired,
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowMouseDown: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    rightFixedColumns: PropTypes.array.isRequired,
    rowClassNameGetter: PropTypes.func,
    rowsCount: PropTypes.number.isRequired,
    rowHeightGetter: PropTypes.func,
    rowPositionGetter: PropTypes.func.isRequired,
    scrollLeft: PropTypes.number.isRequired,
    scrollableColumns: PropTypes.array.isRequired,
    showLastRowBorder: PropTypes.bool,
    width: PropTypes.number.isRequired,
  },

  getInitialState() /*object*/ {
    this._rowBuffer =
      new FixedDataTableRowBuffer(
        this.props.rowsCount,
        this.props.defaultRowHeight,
        this.props.height,
        this._getRowHeight
      );
    return ({
      rowsToRender: this._rowBuffer.getRows(
        this.props.firstRowIndex,
        this.props.firstRowOffset
      ),
    });
  },

  componentWillMount() {
    this._staticRowArray = [];
    this._initialRender = true;
  },

  componentDidMount() {
    setTimeout(this._updateBuffer, 1000);
    this._initialRender = false;
  },

  componentWillReceiveProps(/*object*/ nextProps) {
    if (nextProps.rowsCount !== this.props.rowsCount ||
        nextProps.defaultRowHeight !== this.props.defaultRowHeight ||
        nextProps.height !== this.props.height) {
      this._rowBuffer =
        new FixedDataTableRowBuffer(
          nextProps.rowsCount,
          nextProps.defaultRowHeight,
          nextProps.height,
          this._getRowHeight
        );
    }
    if (this.props.isScrolling && !nextProps.isScrolling) {
      this._updateBuffer();
    } else {
      this.setState({
        rowsToRender: this._rowBuffer.getRows(
          nextProps.firstRowIndex,
          nextProps.firstRowOffset
        ),
      });
    }
  },

  _updateBuffer() {
    if (this.isMounted()) {
      this.setState({
        rowsToRender: this._rowBuffer.getRowsWithUpdatedBuffer(),
      });
    }
  },

  shouldComponentUpdate() /*boolean*/ {
    // Don't add PureRenderMixin to this component please.
    return true;
  },

  componentWillUnmount() {
    this._staticRowArray.length = 0;
  },

  render() /*object*/ {
    var props = this.props;
    var rowClassNameGetter = props.rowClassNameGetter || emptyFunction;
    var rowPositionGetter = props.rowPositionGetter;

    var rowsToRender = this.state.rowsToRender;

    //Sort the rows, we slice first to avoid changing original
    var sortedRowsToRender = rowsToRender.slice().sort((a, b) => a - b);
    var rowPositions = {};

    //Row position calculation requires that rows are calculated in order
    sortedRowsToRender.forEach((rowIndex) => {
      rowPositions[rowIndex] = rowPositionGetter(rowIndex);
    });

    this._staticRowArray.length = rowsToRender.length;

    for (var i = 0; i < rowsToRender.length; ++i) {
      var rowIndex = rowsToRender[i];
      var currentRowHeight = this._getRowHeight(rowIndex);
      var rowOffsetTop = rowPositions[rowIndex];

      var hasBottomBorder =
        rowIndex === props.rowsCount - 1 && props.showLastRowBorder;

      this._staticRowArray[i] =
        <FixedDataTableRow
          key={i}
          isScrolling={props.isScrolling}
          index={rowIndex}
          width={props.width}
          height={currentRowHeight}
          scrollLeft={Math.round(props.scrollLeft)}
          offsetTop={Math.round(rowOffsetTop)}
          fixedColumns={props.fixedColumns}
          rightFixedColumns={props.rightFixedColumns}
          scrollableColumns={props.scrollableColumns}
          maxScrollX={props.maxScrollX}
          onClick={props.onRowClick}
          onDoubleClick={props.onRowDoubleClick}
          onMouseDown={props.onRowMouseDown}
          onMouseEnter={props.onRowMouseEnter}
          onMouseLeave={props.onRowMouseLeave}
          className={joinClasses(
            rowClassNameGetter(rowIndex),
            cx('public/fixedDataTable/bodyRow'),
            cx({
              'fixedDataTableLayout/hasBottomBorder': hasBottomBorder,
              'public/fixedDataTable/hasBottomBorder': hasBottomBorder,
            })
          )}
        />;
    }

    var firstRowPosition = props.rowPositionGetter(props.firstRowIndex);

    var style = {
      position: 'absolute',
      pointerEvents: props.isScrolling ? 'none' : 'auto',
    };

    FixedDataTableTranslateDOMPosition(
      style,
      0,
      props.firstRowOffset - firstRowPosition + props.offsetTop,
      this._initialRender,
    );

    return <div style={style}>{this._staticRowArray}</div>;
  },

  _getRowHeight(/*number*/ index) /*number*/ {
    return this.props.rowHeightGetter ?
      this.props.rowHeightGetter(index) :
      this.props.defaultRowHeight;
  },
});

module.exports = FixedDataTableBufferedRows;
