import React from 'react';
import _ from 'lodash';
import { Card, Alert, Button, Form, FormRow, FormField, FormInput, FormSelect, Checkbox, Spinner } from 'elemental';
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
         .catch(({ error }) => {
            this.setMessage(error, 'danger')
            this.setState({ isSubmitting: false });
            window.scrollTo(0, 0);
         });
   },

   deleteProfile() {
      if (window.confirm('Are you sure? This cannot be undone.')) {
         http.del('/api/volunteer')
            .then((response) => {
               window.alert('Your account has been deleted.');
               window.location = '/';
            })
            .catch(({ error }) => this.setMessage(error, 'danger'));
      }
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
      const delay = type === 'danger' ? 6000 : 3000;
      _.delay(() => this.setState({ message: null }), delay );
   },

   render() {
      const volunteer = this.state.volunteer;

      return (
         <Card>
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
                  {/*<FormField label="Emergency Contacts" width="one-half">
                     <FormInput name="emergencyContacts" type="text" defaultValue={volunteer.emergencyContacts} />
                  </FormField>*/}
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

               {/*<FormField>
                  <FileUpload
                     name="photo"
                     buttonLabelInitial="Upload a photo of you"
                     buttonLabelChange="Change your photo"
                     file={volunteer.photo}
                     onChange={this.setPart('photo')}
                  />
               </FormField>*/}

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
                  <FormField label="Additions" width="one-half">
                     <Checkbox name="driversLicence" label="Driver's Licence" defaultChecked={volunteer.driversLicence} />
                     {volunteer.driversLicence &&
                        <div style={indentStyle}>
                           <Checkbox name="truckDriversLicence" label="Truck Driver's Licence" defaultChecked={volunteer.truckDriversLicence} />
                           <Checkbox name="internationalDriversLicence" label="International Driver's Licence" defaultChecked={volunteer.internationalDriversLicence} />
                           <Checkbox name="internationalTruckDriversLicence" label="International Truck Driver's Licence" defaultChecked={volunteer.internationalTruckDriversLicence} />
                           <label className="FormLabel">How many tons are you allowed to drive?</label>
                           <FormInput name="allowedVehicleWeight" type="text" defaultValue={volunteer.allowedVehicleWeight} />
                        </div>
                     }
                     <Checkbox name="experienceOnSea" label="Experience on Sea" defaultChecked={volunteer.experienceOnSea} />
                  </FormField>
                  <FormField label="Boat Driver Permit" width="one-half">
                     <FormSelect name="boatDriverPermit" options={boatDriverPermits} defaultValue={volunteer.boatDriverPermit} onChange={_.noop} />
                  </FormField>
                  <FormField label="Trainings" width="one-half">
                     <p>Please state if you have completed any trainings that may be relevant for deployment, e.g. HEAT or PHTLS.</p>
                     <FormInput name="trainings" type="text" defaultValue={volunteer.trainings} />
                  </FormField>
               </FormRow>

               <hr />

               <h3>Profession</h3>

               <FormField>
                  {groups.map(({ label, value }) => (
                     <label key={value} className="Checkbox">
                        <input type="checkbox" className="Checkbox__input" name={value} defaultChecked={volunteer[value]} />
                        <span className="Checkbox__label">{label}</span>
                        {volunteer[value] &&
                           <div style={indentStyle}>
                              <label className="FormLabel">Specialization</label>
                              <FormInput name={`${value}Specialization`} type="text" defaultValue={volunteer[`${value}Specialization`]} />
                           </div>
                        }
                     </label>
                  ))}
               </FormField>

               <hr />

               <h3>Curriculum Vitae</h3>

               <p>In your CV you do not have to tell us your complete history with school education etc., but we need to know your employment and volunteering history. </p>

               <FormRow>
                  <FormField width="one-third">
                     <FileUpload
                        name="cv"
                        buttonLabelInitial="Upload your CV"
                        buttonLabelChange="Change your CV"
                        file={volunteer.cv}
                        onChange={this.setPart('cv')}
                     />
                  </FormField>
                  <FormField label="Or CV as Text" width="two-thirds">
                     <FormInput name="cv_text" type="text" multiline defaultValue={volunteer.cv_text} />
                  </FormField>
               </FormRow>

               <hr />

               {/*<h3>Work Experience</h3>

               <ListEditor
                  headings={['Name of employer', 'Title / role', 'Dates worked', 'Location']}
                  fields={workExperienceFields}
                  values={volunteer.workExperience}
                  onChange={this.setPart('workExperience')}
               />

               <hr />*/}

               <h3>Questions</h3>

               {_.map(questions['Questions'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" defaultValue={volunteer[key]} required />
                  </FormField>
               )}

               {_.map(questions['Personal environment'], (value, key) =>
                  <FormField label={value} key={key}>
                     <FormInput name={key} type="text" defaultValue={volunteer[key]} required />
                  </FormField>
               )}

               <hr />

               <Alert type="info">
                  <strong>Information</strong>
                  <p>
                     We may contact you via email to set up a meeting (in person or via Skype) for an interview. After the interview you may be invited to join us on a mission. Please be aware that in order to complete the application process and join a mission, you are then required to provide the following documents as digital copies:
                     <ul>
                        <li>Colour copy of your passport</li>
                        <li>Passport-style picture</li>
                        <li>Copy of your relevant degree or certificate</li>
                        <li>For doctors: approbation, proof of specialisation, and license to practice (if available)</li>
                        <li>For other medical personnel: exam and license to practice (if available)</li>
                        <li>Reference contact of your current or most recent employer</li>
                        <li>Copy of your vaccination record</li>
                        <li>Certificate of medical clearance</li>
                        <li>Child safety check / background check ("erweitertes Führungszeugnis")</li>
                        <li>Certificates of trainings completed (as stated in the questionnaire) </li>
                        <li>Emergency contact</li>
                     </ul>
                  </p>
               </Alert>

               <div style={{ position: 'sticky', position: '-webkit-sticky', bottom: 0, padding: '1rem', backgroundColor: '#fff', textAlign: 'center' }}>
                  <Button type="primary" submit style={{ padding: '0 2rem' }}>
                     Save Data {this.state.isSubmitting && <Spinner type="inverted" />}
                  </Button>
               </div>

               <Button type="danger" size="sm" onClick={this.deleteProfile}>Delete Profile</Button>
            </Form>
         </Card>
      );
   },

});
