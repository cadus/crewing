import React from 'react';
import _ from 'lodash';
import { Button, FormRow, FormField, FormInput, InputGroup } from 'elemental';
import DateInput from './DateInput';

export default React.createClass({

   propTypes: {
      headings: React.PropTypes.array,
      fields: React.PropTypes.array.isRequired,
      values: React.PropTypes.array,
      onChange: React.PropTypes.func,
   },

   getDefaultProps() {
      return {
         headings: [],
         fields: [],
         values: [],
         onChange: _.noop,
      };
   },

   getInitialState() {
      // nulls are problematic later and have to be changed to an empty string
      const values = _.map(this.props.values, (entry) => {
         const newEntry = _.clone(entry);
         _.each(newEntry, (value, name) => { newEntry[name] = value == null ? '' : value; });
         return newEntry;
      });

      return { values };
   },

   onChange(event, id, name, value) {
      if (event && event.stopPropagation) {
         event.stopPropagation(); // don't trigger parents listeners; they get notified later
      }
      const values = this.state.values;
      _.find(values, ['_id', id])[name] = value;
      this.setState({ values }, this.notifyParent);
   },

   removeEntry(id) {
      if (!window.confirm('Sure?')) return;

      const values = this.state.values;
      _.remove(values, n => n._id === id);

      // last entry can't be deleted, so we have to add a new one
      const callback = values.length ? this.notifyParent : this.addEntry;

      this.setState({ values }, callback);
   },
   addEntry() {
      const values = this.state.values;
      const newEntry = { _id: _.uniqueId() };
      _.each(this.props.fields, (field) => { newEntry[field.name] = ''; });
      values.push(newEntry);
      this.setState({ values }, this.notifyParent);
   },

   notifyParent() {
      this.props.onChange(this.state.values);
   },

   render() {
      const bindOnChange = id => event => this.onChange(event, id, event.target.name, event.target.value);
      const bindRemove = id => () => this.removeEntry(id);
      const cellWidth = ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth'][this.props.headings.length];
      const cellClass = `one-${cellWidth}`;

      return (
         <div style={{ marginBottom: '2em' }}>
            {this.props.headings.length > 0 &&
               <FormRow>
                  {_.map(this.props.headings, (heading, i) => <FormField label={heading} width={cellClass} key={i} />)}
               </FormRow>
            }

            {_.map(this.state.values, value =>
               <InputGroup key={value._id} onChange={bindOnChange(value._id)}>

                  {_.map(this.props.fields, field =>
                     <InputGroup.Section key={field.name} grow>
                        {field.type === 'date' ?
                           <DateInput
                              name={field.name}
                              defaultValue={(field.formatter || _.identity)(value[field.name])}
                              onChange={date => this.onChange(null, value._id, field.name, date)}
                           />
                        :
                           <FormInput
                              name={field.name}
                              type={field.type || 'text'}
                              defaultValue={(field.formatter || _.identity)(value[field.name])}
                           />
                        }
                     </InputGroup.Section>
                  )}

                  <InputGroup.Section>
                     <Button type="default" onClick={bindRemove(value._id)}>Remove</Button>
                  </InputGroup.Section>
               </InputGroup>
            )}
            <Button type="default" onClick={this.addEntry}>Add an Entry</Button>
         </div>
      );
   },

});
