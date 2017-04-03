import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import _ from 'lodash';

export default React.createClass({

   propTypes: {
      name: React.PropTypes.string.isRequired,
      onChange: React.PropTypes.func.isRequired,
      defaultValue: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
   },

   getDefaultProps() {
      return {
         defaultValue: null,
      };
   },

   onChange(momentData) {
      this.props.onChange(momentData ? momentData.format() : momentData);
   },

   onChangeRaw(event) {
      this.props.onChange(event.target.value);
   },

   render() {
      const defaultValue = this.props.defaultValue;
      const value = defaultValue && typeof defaultValue === 'string' ? moment(defaultValue, moment.ISO_8601) : defaultValue;
      const rest = _.omit(this.props, ['onChange', 'onChangeRaw']);

      return (
         <DatePicker
            className="FormInput"
            selected={value || null}
            onChange={this.onChange}
            onChangeRaw={this.onChangeRaw}
            {...rest}
         />
      );
   },

});
