import React from 'react';
import _ from 'lodash';
import { Button, Spinner, Form, FormField, FormInput, Modal, ModalHeader, ModalBody } from 'elemental';
import Select from 'react-select';
import * as http from '../lib/http';

export default React.createClass({

   propTypes: {
      isOpen: React.PropTypes.bool,
      onClose: React.PropTypes.func,
      title: React.PropTypes.string,
      subject: React.PropTypes.string,
      content: React.PropTypes.string,
      contacts: React.PropTypes.array,
   },

   getDefaultProps() {
      return {
         isOpen: true,
         onClose: _.noop,
         title: '',
         subject: '',
         content: '',
         contacts: [],
      };
   },

   getInitialState() {
      return {
         isOpen: this.props.isOpen,
         subject: this.props.subject,
         content: this.props.content,
         recipients: _.filter(this.props.contacts, 'isRecipient'),
         isSubmitting: false,
         isSubmitted: false,
      };
   },

   onChange({ target }) {
      this.setState({ [target.name]: target.value });
   },

   addRecipient(recipients) {
      this.setState({ recipients });
   },

   send(event) {
      event.preventDefault();
      this.setState({ isSubmitting: true });

      const body = new window.FormData();
      body.append('subject', this.state.subject);
      body.append('content', this.state.content);
      body.append('recipients', _.map(this.state.recipients, 'value'));

      http.post('/api/email', { body })
         .then(({ volunteer }) => this.setState({ isSubmitted: true }))
         .catch(({ error }) => this.setState({ error }));
   },

   renderForm() {
      const canSend = this.state.recipients.length && this.state.subject && this.state.content && !this.state.isSent;

      return (
         <Form onChange={this.onChange} onSubmit={this.send}>
            <FormField label="Recipients">
               <Select
                  multi
                  value={this.state.recipients}
                  options={this.props.contacts}
                  onChange={this.addRecipient}
                  required
               />
            </FormField>

            <FormField label="Subject">
               <FormInput
                  name="subject"
                  type="text"
                  defaultValue={this.state.subject}
                  onChange={this.onChange}
                  required
               />
            </FormField>

            <FormField label="Content">
               <FormInput
                  name="content"
                  type="text"
                  multiline
                  rows={10}
                  defaultValue={this.state.content}
                  onChange={this.onChange}
                  required
               />
            </FormField>

            <Button type="primary" block submit disabled={!canSend}>
               Send Emails {this.state.isSubmitting && <Spinner type="inverted" />}
            </Button>
         </Form>
      );
   },

   render() {
      const onClose = this.props.onClose;
      const isOpen = this.state.isOpen;

      return (
         <Modal isOpen={isOpen} onCancel={onClose} backdropClosesModal>
            <ModalHeader text={this.props.title || 'Email Editor'} showCloseButton onClose={onClose} />

            <ModalBody>
               {this.state.isSubmitted
                  ? 'Message sent.'
                  : this.renderForm()
               }
            </ModalBody>
         </Modal>
      );
   },

});
