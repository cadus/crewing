import React from 'react';
import { Button, Form, FormField, FormInput, Alert, Spinner } from 'elemental';
import LoginLinkForm from './LoginLinkForm';
import * as http from '../lib/http';

export default React.createClass({

   getInitialState() {
      return {
         isSubmitting: false,
         submitted: false,
         showResendForm: false,
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
                  <span className="Checkbox__label">I'm accepting the <a href="/">Data Privacy Terms</a></span>
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

      return (
         <div className="box">
            <div className="inner">
               <img src="/images/logo.svg" height="50" alt="cadus crewing" />
               <hr />
               {this.state.submitted ? this.renderResult() : this.renderForm()}
            </div>
         </div>
      );
   },

});
