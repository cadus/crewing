import React from 'react';
import { Button, Form, FormField, FormInput, Alert, Spinner } from 'elemental';
import * as http from '../lib/http';

export default React.createClass({

   getInitialState() {
      return {
         email: '',
         isSubmitting: false,
         submitted: false,
      };
   },

   onChange({ target }) {
      this.setState({ email: target.value });
   },

   onSubmit(ev) {
      ev.preventDefault();
      this.setState({ isSubmitting: true });
      const body = new window.FormData();
      body.append('email', this.state.email);
      http.post('/api/volunteer/token', { body })
         .then(() => this.setState({ submitted: true }))
         .catch(error => this.setState({ submitted: true, error: error.detail.error }));
   },

   renderResult() {
      if (this.state.error) {
         return <Alert type="danger"><strong>Couldn't send login link:</strong> {this.state.error}</Alert>;
      }
      return (
         <div>
            <h2 style={{ marginBottom: 0 }}>Login changed!</h2>
            <p className="lead" style={{ marginTop: '1rem', marginBottom: 0 }}>We've send you an email with the new login link. Please check your inbox.</p>
         </div>
      );
   },

   renderForm() {
      return (
         <div>
            <h2>Request Login Link</h2>
            <Form onChange={this.onChange} onSubmit={this.onSubmit}>
               <FormField label="Email address">
                  <FormInput name="email" type="email" autoFocus required defaultValue={this.state.email} />
               </FormField>
               <hr />
               <Button type="primary" block submit>
                  {this.state.isSubmitting ? <Spinner type="inverted" /> : 'Send login link'}
               </Button>
            </Form>
         </div>
      );
   },

   render() {
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
