import React from 'react';
import _ from 'lodash';
import { Button, Form, FormRow, FormField, FormInput, FormSelect, FileUpload, Checkbox, Alert, Spinner } from 'elemental';
import ListEditor from './ListEditor';
import * as http from '../lib/http';
import formData from '../lib/formData';
import formatDate from '../lib/formatDate';
import questions from '../../shared/questions.json';

const groups = [
  { value: 'captain', label: 'Captain' },
  { value: 'helper', label: 'Helper' },
  { value: 'journalist', label: 'Journalist' },
  { value: 'medic', label: 'Medic' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'technician', label: 'Technician' },
];

const boatDriverPermits = [
   { value: '', label: 'none' },
   { value: 'Class 1', label: 'Class 1' },
   { value: 'Class 2', label: 'Class 2' },
   { value: 'Class 3', label: 'Class 3' },
];

const availabilityFields = ['from', 'till', 'confirmationTill']
   .map(name => ({ name, type: 'date', formatter: formatDate }));

const workExperienceFields = ['employer', 'role', 'time', 'location'].map(name => ({ name }));

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
         isSubmitting: false,
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
      this.setState({ isSubmitting: true });

      const values = _.omit(this.state, _.keys(this.getInitialState()));
      const body = formData(values);

      http.put('/api/volunteer', { body })
         .then(() => {
            this.setState({ isSubmitting: false });
            this.setMessage('Changes were saved.', 'success');
         })
         .catch(error => this.setMessage(error.message, 'danger'));
   },

   setAvailabilities(availabilities) {
      console.log('setAvailabilities', availabilities);
      this.setState({ availabilities });
   },

   setWorkExperience(workExperience) {
      this.setState({ workExperience });
   },

   setMessage(text, type) {
      this.setState({ message: { text, type } });
      _.delay(() => this.setState({ message: null }), 3000);
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
                  <FormField label="First name" width="one-half">
                     <FormInput name="name.first" type="text" required defaultValue={state.name.first} />
                  </FormField>
                  <FormField label="Last name" width="one-half">
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
                  <FormField label="Emergency Contacts" width="one-half">
                     <FormInput name="emergencyContacts" type="text" required defaultValue={state.emergencyContacts} />
                  </FormField>
                  <FormField label="Languages" width="one-half">
                     <FormInput name="languages" type="text" required defaultValue={state.languages} />
                  </FormField>
               </FormRow>

               <FormField label="Medication">
                  <FormInput name="medication" type="text" required defaultValue={state.medication} />
               </FormField>

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

               <hr />

               <h3>Availabilities</h3>

               <ListEditor
                  headings={['Available from', 'Available till', 'Confirmation till']}
                  fields={availabilityFields}
                  values={state.availabilities}
                  onChange={this.setAvailabilities}
               />

               <hr />

               <h3>Qualification</h3>

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
                        file={state.passport}
                     />
                  </FormField>

                  {this.state.group === 'journalist' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="presscard"
                           buttonLabelInitial="Upload a scan of your presscard"
                           buttonLabelChange="Change the scan of your presscard"
                           file={state.presscard}
                        />
                     </FormField>
                  }

                  {this.state.group === 'medic' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="approbation"
                           buttonLabelInitial="Upload a scan of your approbation"
                           buttonLabelChange="Change the scan of your approbation"
                           file={state.approbation}
                        />
                     </FormField>
                  }
               </FormRow>

               <hr />

               <h3>Work Experience</h3>

               <ListEditor
                  headings={['Name of employer', 'Title / role', 'Dates worked', 'Location']}
                  fields={workExperienceFields}
                  values={state.workExperience}
                  onChange={this.setWorkExperience}
               />

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

               <Button type="primary" onClick={this.onSubmit}>
                  Save Data {this.state.isSubmitting && <Spinner type="inverted" />}
               </Button>
            </Form>
         </div>
      );
   },

});
