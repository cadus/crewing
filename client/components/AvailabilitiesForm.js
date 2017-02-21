import React from 'react';
import _ from 'lodash';
import { Button, FormRow, FormField, FormInput, InputGroup } from 'elemental';
import formatDate from '../lib/formatDate';

export default React.createClass({

   propTypes: {
      availabilities: React.PropTypes.array,
      onChange: React.PropTypes.func,
   },

   getDefaultProps() {
      return {
         availabilities: [],
         onChange: _.noop,
      };
   },

   getInitialState() {
      return {
         availabilities: this.props.availabilities,
      };
   },

   onChange(id, name, value) {
      const availabilities = this.state.availabilities;
      _.find(availabilities, ['_id', id])[name] = value;
      this.setState({ availabilities }, this.notifyParent);
   },

   removeAvailability(id) {
      if (!window.confirm('Sure?')) return;
      const availabilities = this.state.availabilities;
      _.remove(availabilities, n => n._id === id);
      this.setState({ availabilities }, this.notifyParent);
   },
   addAvailability() {
      const availabilities = this.state.availabilities;
      availabilities.push({ _id: _.uniqueId() });
      this.setState({ availabilities }, this.notifyParent);
   },

   notifyParent() {
      this.props.onChange(this.state.availabilities);
   },

   render() {
      const bindOnChange = id => ({ target }) => this.onChange(id, target.name, target.value);
      const bindRemove = id => () => this.removeAvailability(id);

      return (
         <div>
            <FormRow>
               <FormField label="Available from" width="one-third" />
               <FormField label="Available till" width="one-third" />
               <FormField label="Confirmation till" width="one-third" />
            </FormRow>

            {_.map(this.state.availabilities, availability =>
               <InputGroup key={availability._id} onChange={bindOnChange(availability._id)}>
                  <InputGroup.Section grow>
                     <FormInput name="from" type="date" defaultValue={this.formatDate(availability.from)} />
                  </InputGroup.Section>
                  <InputGroup.Section grow>
                     <FormInput name="till" type="date" defaultValue={this.formatDate(availability.till)} />
                  </InputGroup.Section>
                  <InputGroup.Section grow>
                     <FormInput name="confirmationTill" type="date" defaultValue={this.formatDate(availability.confirmationTill)} />
                  </InputGroup.Section>
                  <InputGroup.Section>
                     <Button type="default" onClick={bindRemove(availability._id)}>Remove</Button>
                  </InputGroup.Section>
               </InputGroup>
            )}
            <Button type="default" onClick={this.addAvailability}>Add Availability</Button>
         </div>
      );
   },

});
