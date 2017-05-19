import React from 'react';
import _ from 'lodash';
import { FormInput } from 'elemental';

export default React.createClass({

   propTypes: {
      comment: React.PropTypes.string,
      url: React.PropTypes.string,
      onChange: React.PropTypes.func,
   },

   getDefaultProps() {
      return {
         comment: '',
         url: '',
         onChange() {},
      };
   },

   componentDidMount() {
      this.saveComment = _.debounce(this.saveComment, 1000);
   },

   getInitialState() {
      return {
         comment: this.props.comment,
         savingStatus: '',
      };
   },

   onChange(event) {
      this.setState({ comment: event.target.value }, this.saveComment);
   },

   saveComment() {
      this.setState({ savingStatus: 'saving' });

      const promise = this.props.onChange(this.state.comment);

      if (promise && promise.then) {
         promise.then(() => {
            this.setState({ savingStatus: 'saved' });
            _.delay(() => this.setState({ savingStatus: '' }), 2000);
         });
      }
   },

   render() {
      return (
         <div>
            <FormInput
               name="comment"
               type="text"
               rows="2"
               style={{ minHeight: 0 }}
               multiline
               defaultValue={this.state.comment}
               onChange={this.onChange}
            />
            {this.state.savingStatus &&
               <span style={{ position: 'absolute', right: 5, top: 0, color: '#ccc' }}>
                  {this.state.savingStatus}
               </span>
            }
         </div>
      );
   },

});
