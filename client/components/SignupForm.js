import React from 'react';
import { Button, Form, FormField, FormInput, Alert, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from 'elemental';
import LoginLinkForm from './LoginLinkForm';
import * as http from '../lib/http';

export default React.createClass({

   getInitialState() {
      return {
         isSubmitting: false,
         submitted: false,
         showResendForm: false,
         showModal: false,
      };
   },

   onChange({ target }) {
      if (target.type === 'checkbox') {
         this.setState({ [target.name]: target.checked });
      }
      else {
         this.setState({ [target.name]: target.value });
      }
   },

   onSubmit(ev) {
      ev.preventDefault();
      this.setState({ isSubmitting: true });
      const body = new window.FormData();
      ['name', 'email', 'dataPrivacy'].map(field => body.append(field, this.state[field]));
      http.post('/api/volunteer', { body })
         .then(() => this.setState({ submitted: true }))
         .catch(({ error }) => this.setState({ submitted: true, error }));
   },

   renderResult() {
      if (this.state.error) {
         return <Alert type="danger"><strong>Couldn't sign you up:</strong> {this.state.error}</Alert>;
      }
      return (
         <div>
            <h2 style={{ marginBottom: 0 }}>Thanks for signing up!</h2>
            <p className="lead" style={{ marginTop: '1rem', marginBottom: 0 }}>We've send you an email with further infos. Please check your inbox.</p>
         </div>
      );
   },

   renderForm() {
      const toggleResend = () => this.setState({ showResendForm: true });
      const showModal = () => this.setState({ showModal: true });

      return (
         <div>
            <h2 style={{ marginBottom: 0 }}>Welcome,</h2>
            <p className="lead" style={{ marginTop: '1rem' }}>if you want to help us, start here and sign up:</p>
            <Form onChange={this.onChange} onSubmit={this.onSubmit}>
               <FormField label="Name">
                  <FormInput name="name" autoFocus required />
               </FormField>
               <FormField label="Email address">
                  <FormInput name="email" type="email" required />
               </FormField>
               <label className="Checkbox">
                  <input type="checkbox" name="dataPrivacy" className="Checkbox__input" required />
                  <span className="Checkbox__label">I'm accepting the <a href="#" onClick={showModal}>Privacy Policy</a></span>
               </label>
               <hr />
               <Button type="primary" block submit>
                  {this.state.isSubmitting ? <Spinner type="inverted" /> : 'Sign Up'}
               </Button>
            </Form>
            <footer>
               <Button type="link" block onClick={toggleResend}>Lost the login link?</Button>
            </footer>
         </div>
      );
   },

   render() {
      if (this.state.showResendForm) {
         return <LoginLinkForm />;
      }

      const hideModal = () => this.setState({ showModal: false });

      return (
         <div className="box">
            <div className="inner">
               <img src="/images/logo.svg" height="50" alt="cadus crewing" />
               <hr />
               {this.state.submitted ? this.renderResult() : this.renderForm()}
            </div>
            {this.state.showModal &&
               <Modal isOpen onCancel={hideModal} backdropClosesModal>
                  <ModalHeader text="Privacy Policy" showCloseButton onClose={hideModal} />
                  <ModalBody>
                     <p>When contacting CADUS e.V. via the following contact form, the data that you provide will be stored by CADUS e.V. The requested details serve the application procedure and possible future collaboration with CADUS e.V. The communication of the details is expressly done voluntarily and with your consent, in line with Art. 6 (1a) GDPR.</p>
                     <p>As far as the data given involves communication channels (e.g. e-mail-address, phone number), you consent that we contact you via these channels if appropriate. Of course, you can revoke this consent for the future at any time.</p>
                     <p>Your personal data will exclusively be used for the purpose of the work of CADUS e.V. The data obtained will only be viewed by associates of CADUS e.V. and only used for the purpose of following the objectives of CADUS e.V. None of your data will be passed on to third parties.</p>
                     <p>We will delete the data obtained after its storing is not necessary anymore, or if you wish that your data is deleted. In case statutory storage obligations persist, we will restrict the processing of your data.</p>
                     <p>You can object to the storing of your data at any time by sending an e-mail to crewing/at/cadus.org.</p>
                     <p>The data protection officer is Christoph Löffler. Contact: christoph/at/cadus.org</p>
                  </ModalBody>
                  <ModalFooter>
                     <Button type="primary" onClick={hideModal}>Schließen</Button>
                  </ModalFooter>
               </Modal>
            }
         </div>
      );
   },

});
