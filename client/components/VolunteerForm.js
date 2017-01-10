import React from 'react';
import _ from 'lodash';
import { Button, Form, FormRow, FormField, FormInput, FormSelect, FileUpload, Checkbox, Alert } from 'elemental';
import * as http from '../lib/http';

export default React.createClass({

   propTypes: {
      volunteer: React.PropTypes.object,
   },

   getDefaultProps() {
      return {
         volunteer: {},
      };
   },

   getInitialState() {
      return {
         message: null,
      };
   },

   onChange({ target }) {
      if (target.type === 'file') {
         this.setState({ [target.name]: target.files[0] });
      }
      else if (target.type === 'checkbox') {
         this.setState({ [target.name]: target.checked });
      }
      else {
         this.setState({ [target.name]: target.value });
      }
   },

   onSubmit() {
      const body = new window.FormData();
      _.each(this.state, (value, key) => body.append(key, value));
      http.put('/api/volunteer', { body })
         .then(() => this.setMessage('Changes were saved.', 'success'))
         .catch(error => this.setMessage(error.message, 'danger'));
   },

   setMessage(text, type) {
      this.setState({ message: { text, type } });
      _.delay(() => this.setState({ message: null }), 3000);
   },

   formatDate(isoDateString) {
      const date = new Date(isoDateString);
      const month = (date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1);
      return `${date.getFullYear()}-${month}-${date.getDate()}`; // 2016-12-23
   },

   render() {
      const groups = [
        { value: 'medic', label: 'Medic' },
        { value: 'helper', label: 'Helper' },
        { value: 'captain', label: 'Captain' },
        { value: 'journalist', label: 'Journalist' },
        { value: 'photographer', label: 'Photographer' },
      ];

      const state = Object.assign({}, this.props.volunteer, this.state);

      return (
         <div>
            {this.state.message &&
               <Alert type={this.state.message.type}>{this.state.message.text}</Alert>
            }
            <Form onChange={this.onChange}>
               <FormRow>
                  <FormField label="Firstname" width="one-half">
                     <FormInput name="name.first" type="text" required defaultValue={state.name.first} />
                  </FormField>
                  <FormField label="Lastname" width="one-half">
                     <FormInput name="name.last" type="text" required defaultValue={state.name.last} />
                  </FormField>
               </FormRow>
               <FormField label="Email address">
                  <FormInput name="email" type="email" required defaultValue={state.email} />
               </FormField>
               <FormField>
                  <FileUpload name="photo" buttonLabelInitial="Upload Photo" buttonLabelChange="Change Photo" file={state.photo} />
               </FormField>
               <FormRow>
                  <FormField label="Available From" width="one-half">
                     <FormInput name="availableFrom" type="date" defaultValue={this.formatDate(state.availableFrom)} />
                  </FormField>
                  <FormField label="Available Till" width="one-half">
                     <FormInput name="availableTill" type="date" defaultValue={this.formatDate(state.availableTill)} />
                  </FormField>
               </FormRow>
               <FormField label="Group">
                  <FormSelect name="group" options={groups} defaultValue={state.group} onChange={_.noop} />
               </FormField>
               <FormField>
                  <Checkbox name="paramedic" label="Paramedic" defaultChecked={state.paramedic} />
                  <Checkbox name="doctor" label="Doctor" defaultChecked={state.doctor} />
                  <Checkbox name="emergencydoctor" label="Emergency Doctor" defaultChecked={state.emergencydoctor} />
                  <Checkbox name="lifeguard" label="Lifeguard" defaultChecked={state.lifeguard} />
                  <Checkbox name="experienceOnSea" label="Experience on Sea" defaultChecked={state.experienceOnSea} />
               </FormField>
               <FormField>
                  <FileUpload name="passport" buttonLabelInitial="Upload Scan of Passport" buttonLabelChange="Change Scan of Passport" file={state.passport} />
               </FormField>
               <hr />
               <Button type="primary" onClick={this.onSubmit}>Save Data</Button>
            </Form>
         </div>
      );
   },

});
