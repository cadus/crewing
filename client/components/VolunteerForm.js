import React from 'react';
import _ from 'lodash';
import { Button, Form, FormRow, FormField, FormInput, FormSelect, FileUpload, Checkbox, Alert } from 'elemental';
import * as http from '../lib/http';
import questions from '../../shared/questions.json';

const groups = [
  { value: 'medic', label: 'Medic' },
  { value: 'helper', label: 'Helper' },
  { value: 'captain', label: 'Captain' },
  { value: 'journalist', label: 'Journalist' },
  { value: 'photographer', label: 'Photographer' },
];

const boatDriverPermits = [
   { value: '', label: 'none' },
   { value: 'class1', label: 'Class 1' },
   { value: 'class2', label: 'Class 2' },
   { value: 'class3', label: 'Class 3' },
];

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

               <FormRow>
                  <FormField label="Email address" width="one-half">
                     <FormInput name="email" type="email" required defaultValue={state.email} />
                  </FormField>
                  <FormField label="Phone number" width="one-half">
                     <FormInput name="phone" type="text" required defaultValue={state.phone} />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Address" width="one-half">
                     <FormInput name="address" type="text" multiline required defaultValue={state.address} />
                  </FormField>
                  <FormField label="Notes" width="one-half">
                     <FormInput name="notes" type="text" multiline required defaultValue={state.notes} />
                  </FormField>
               </FormRow>

               <FormField>
                  <FileUpload name="photo" buttonLabelInitial="Upload a photo of you" buttonLabelChange="Change your photo" file={state.photo} />
               </FormField>

               <FormRow>
                  <FormField label="Available From" width="one-half">
                     <FormInput name="availableFrom" type="date" defaultValue={this.formatDate(state.availableFrom)} />
                  </FormField>
                  <FormField label="Available Till" width="one-half">
                     <FormInput name="availableTill" type="date" defaultValue={this.formatDate(state.availableTill)} />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Group" width="one-half">
                     <FormSelect name="group" options={groups} defaultValue={state.group} onChange={_.noop} />
                  </FormField>
                  <FormField label="Boat Driver Permit" width="one-half">
                     <FormSelect name="boatDriverPermit" options={boatDriverPermits} defaultValue={state.boatDriverPermit} onChange={_.noop} />
                  </FormField>
               </FormRow>

               <FormField>
                  <Checkbox name="paramedic" label="Paramedic" defaultChecked={state.paramedic} />
                  <Checkbox name="doctor" label="Doctor" defaultChecked={state.doctor} />
                  <Checkbox name="emergencydoctor" label="Emergency Doctor" defaultChecked={state.emergencydoctor} />
                  <Checkbox name="lifeguard" label="Lifeguard" defaultChecked={state.lifeguard} />
                  <Checkbox name="experienceOnSea" label="Experience on Sea" defaultChecked={state.experienceOnSea} />
               </FormField>

               <FormRow>
                  <FormField width="one-half">
                     <FileUpload
                        name="passport"
                        buttonLabelInitial="Upload a scan of your passport"
                        buttonLabelChange="Change the scan of your passport"
                        file={state.passport} />
                  </FormField>

                  {this.state.group === 'journalist' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="presscard"
                           buttonLabelInitial="Upload a scan of your presscard"
                           buttonLabelChange="Change the scan of your presscard"
                           file={state.presscard} />
                     </FormField>
                  }

                  {this.state.group === 'medic' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="approbation"
                           buttonLabelInitial="Upload a scan of your approbation"
                           buttonLabelChange="Change the scan of your approbation"
                           file={state.approbation} />
                     </FormField>
                  }
               </FormRow>

               <hr />

               <h3>Questions</h3>
               {_.map(questions['Questions'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" required defaultValue={state[key]} />
                  </FormField>
               )}

               <h3>Personal environment</h3>
               <p>Your experiences during a mission can best be processed if you have a stable and supporting personal environment. If in your current life situation everything is upheaval, this might not be the right time for a mission.</p>

               {_.map(questions['Personal environment'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" required defaultValue={state[key]} />
                  </FormField>
               )}

               <hr />

               <Button type="primary" onClick={this.onSubmit}>Save Data</Button>
            </Form>
         </div>
      );
   },

});
