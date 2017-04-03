import React from 'react';
import _ from 'lodash';
import { Button, Form, FormRow, FormField, FormInput, FormSelect, Checkbox, Alert, Spinner } from 'elemental';
import FileUpload from './FileUpload';
import DateInput from './DateInput';
import ListEditor from './ListEditor';
import * as http from '../lib/http';
import formData from '../lib/formData';
import questions from '../../shared/questions.json';
import groupsJSON from '../../shared/groups.json';

const groups = groupsJSON.map(name => ({ value: name, label: _.startCase(name) }));

const boatDriverPermits = [
   { value: '', label: 'none' },
   { value: 'Class 1', label: 'Class 1' },
   { value: 'Class 2', label: 'Class 2' },
   { value: 'Class 3', label: 'Class 3' },
];

const availabilityFields = ['from', 'till', 'confirmationTill']
   .map(name => ({ name, type: 'date' }));

const workExperienceFields = ['employer', 'role', 'time', 'location'].map(name => ({ name }));

const indentStyle = { paddingLeft: 23 };

export default React.createClass({

   propTypes: {
      volunteer: React.PropTypes.object,
      onChange: React.PropTypes.func,
   },

   getDefaultProps() {
      return {
         volunteer: {},
         onChange: _.noop,
      };
   },

   getInitialState() {
      return {
         message: null,
         isSubmitting: false,
         volunteer: _.cloneDeep(this.props.volunteer),
      };
   },

   onChange(event) {
      const volunteer = this.state.volunteer;

      if (event.target) {
         const target = event.target;
         if (target.type === 'file') {
            // can be ignored as it's handled by the FileUpload component
            // volunteer[target.name] = target.files[0];
         }
         else if (target.type === 'checkbox') {
            volunteer[target.name] = target.checked;
         }
         else {
            volunteer[target.name] = target.value;
         }
      }
      else {
         volunteer[event.name] = event.value;
      }

      this.setState({ volunteer });
   },

   onSubmit(event) {
      event.preventDefault();

      this.setState({ isSubmitting: true });

      const oldVolunteer = this.props.volunteer;
      const newVolunteer = this.state.volunteer;
      const values = this.getDiff(oldVolunteer, newVolunteer);
      const body = formData(values);

      http.put('/api/volunteer', { body })
         .then(({ volunteer }) => {
            this.props.onChange(volunteer);
            this.setState({
               volunteer: _.cloneDeep(volunteer),
               isSubmitting: false,
            });
            this.setMessage('Changes were saved.', 'success');
         })
         .catch(({ error }) => this.setMessage(error, 'danger'));
   },

   getDiff(oldVolunteer, newVolunteer) {
      return _.transform(newVolunteer, (result, value, key) => {
         if (_.isEqual(oldVolunteer[key], value)) return;
         result[key] = value;
      }, {});
   },

   setPart(name) {
      return (value) => {
         const volunteer = this.state.volunteer;
         volunteer[name] = value;
         this.setState({ volunteer });
      };
   },

   setMessage(text, type) {
      this.setState({ message: { text, type } });
      _.delay(() => this.setState({ message: null }), 3000);
   },

   render() {
      const volunteer = this.state.volunteer;

      return (
         <div>
            {this.state.message
               ? <Alert type={this.state.message.type}>{this.state.message.text}</Alert>
               : <Alert type="info">All blue bordered fields are required.</Alert>
            }

            <Form onChange={this.onChange} onSubmit={this.onSubmit}>

               <FormRow>
                  <FormField label="First name" width="one-half">
                     <FormInput name="name.first" type="text" defaultValue={volunteer.name.first} required />
                  </FormField>
                  <FormField label="Last name" width="one-half">
                     <FormInput name="name.last" type="text" defaultValue={volunteer.name.last} required />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Email address" width="one-half">
                     <FormInput name="email" type="email" defaultValue={volunteer.email} required />
                  </FormField>
                  <FormField label="Date of Birth" width="one-half">
                     <DateInput
                        name="birth"
                        defaultValue={volunteer.birth}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        onChange={value => this.onChange({ name: 'birth', value })}
                        required
                     />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Phone number" width="one-half">
                     <FormInput name="phone" type="text" defaultValue={volunteer.phone} required />
                  </FormField>
                  <FormField label="Emergency Contacts" width="one-half">
                     <FormInput name="emergencyContacts" type="text" defaultValue={volunteer.emergencyContacts} />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Languages" width="one-half">
                     <FormInput name="languages" type="text" defaultValue={volunteer.languages} required />
                  </FormField>
               </FormRow>

               <FormRow>
                  <FormField label="Citizenship" width="one-half">
                     <FormInput name="citizenship" type="text" defaultValue={volunteer.citizenship} required />
                  </FormField>
                  {volunteer.citizenship &&
                     <FormField label="Second Citizenship (if available)" width="one-half">
                        <FormInput name="citizenship2" type="text" defaultValue={volunteer.citizenship2} />
                     </FormField>
                  }
               </FormRow>

               <FormRow>
                  <FormField label="Address" width="one-half">
                     <FormInput name="address" type="text" multiline defaultValue={volunteer.address} required />
                  </FormField>
                  <FormField label="Notes" width="one-half">
                     <FormInput name="notes" type="text" multiline defaultValue={volunteer.notes} />
                  </FormField>
               </FormRow>

               <FormField>
                  <FileUpload
                     name="photo"
                     buttonLabelInitial="Upload a photo of you"
                     buttonLabelChange="Change your photo"
                     file={volunteer.photo}
                     onChange={this.setPart('photo')}
                  />
               </FormField>

               <hr />

               <h3>Availabilities</h3>

               <ListEditor
                  headings={['Available from', 'Available till', 'Confirmation till']}
                  fields={availabilityFields}
                  values={volunteer.availabilities}
                  onChange={this.setPart('availabilities')}
               />

               <hr />

               <h3>Qualification</h3>

               <FormRow>
                  <FormField label="Group" width="one-half">
                     <FormSelect name="group" options={groups} defaultValue={volunteer.group} onChange={_.noop} />
                  </FormField>
                  <FormField label="Boat Driver Permit" width="one-half">
                     <FormSelect name="boatDriverPermit" options={boatDriverPermits} defaultValue={volunteer.boatDriverPermit} onChange={_.noop} />
                  </FormField>
               </FormRow>

               <FormField>
                  <Checkbox name="driversLicence" label="Driver's Licence" defaultChecked={volunteer.driversLicence} />
                  {volunteer.driversLicence &&
                     <div style={indentStyle}>
                        <Checkbox name="truckDriversLicence" label="Truck Driver's Licence" defaultChecked={volunteer.truckDriversLicence} />
                        <Checkbox name="internationalDriversLicence" label="International Driver's Licence" defaultChecked={volunteer.internationalDriversLicence} />
                        <Checkbox name="internationalTruckDriversLicence" label="International Truck Driver's Licence" defaultChecked={volunteer.internationalTruckDriversLicence} />
                     </div>
                  }

                  <Checkbox name="paramedic" label="Paramedic" defaultChecked={volunteer.paramedic} />

                  <label className="Checkbox">
                     <input type="checkbox" className="Checkbox__input" name="doctor" defaultChecked={volunteer.doctor} />
                     <span className="Checkbox__label">Doctor</span>
                     {volunteer.doctor &&
                        <div style={indentStyle}>
                           <label className="FormLabel">Specialization</label>
                           <FormInput name="doctorSpecialization" type="text" defaultValue={volunteer.doctorSpecialization} />
                        </div>
                     }
                  </label>

                  <Checkbox name="emergencydoctor" label="Emergency Doctor" defaultChecked={volunteer.emergencydoctor} />
                  <Checkbox name="lifeguard" label="Lifeguard" defaultChecked={volunteer.lifeguard} />
                  <Checkbox name="experienceOnSea" label="Experience on Sea" defaultChecked={volunteer.experienceOnSea} />
               </FormField>

               <FormRow>
                  <FormField width="one-half">
                     <FileUpload
                        name="passport"
                        buttonLabelInitial="Upload a scan of your passport"
                        buttonLabelChange="Change the scan of your passport"
                        file={volunteer.passport}
                        onChange={this.setPart('passport')}
                     />
                  </FormField>

                  {volunteer.group === 'journalist' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="presscard"
                           buttonLabelInitial="Upload a scan of your presscard"
                           buttonLabelChange="Change the scan of your presscard"
                           file={volunteer.presscard}
                           onChange={this.setPart('presscard')}
                        />
                     </FormField>
                  }

                  {volunteer.group === 'medic' &&
                     <FormField width="one-half">
                        <FileUpload
                           name="approbation"
                           buttonLabelInitial="Upload a scan of your approbation"
                           buttonLabelChange="Change the scan of your approbation"
                           file={volunteer.approbation}
                           onChange={this.setPart('approbation')}
                        />
                     </FormField>
                  }
               </FormRow>

               <hr />

               <h3>Work Experience</h3>

               <ListEditor
                  headings={['Name of employer', 'Title / role', 'Dates worked', 'Location']}
                  fields={workExperienceFields}
                  values={volunteer.workExperience}
                  onChange={this.setPart('workExperience')}
               />

               <hr />

               <h3>Questions</h3>

               <Alert type="info">
                  The following information is confidential and will only be reviewed by the person responsible for crewing. We guarantee that your information will not be shared with third parties and is not accessable by other members / employees at Cadus.
               </Alert>

               {_.map(questions['Questions'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" defaultValue={volunteer[key]} required />
                  </FormField>
               )}

               <h3>Personal environment</h3>

               <p>Your experiences during a mission can best be processed if you have a stable and supporting personal environment. If in your current life situation everything is upheaval, this might not be the right time for a mission.</p>

               {_.map(questions['Personal environment'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" defaultValue={volunteer[key]} required />
                  </FormField>
               )}

               <div style={{ position: 'sticky', bottom: 0, padding: '1rem', backgroundColor: '#fff', textAlign: 'center' }}>
                  <Button type="primary" submit style={{ padding: '0 2rem' }}>
                     Save Data {this.state.isSubmitting && <Spinner type="inverted" />}
                  </Button>
               </div>

            </Form>
         </div>
      );
   },

});
