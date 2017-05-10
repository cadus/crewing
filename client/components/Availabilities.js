import React from 'react';
import _ from 'lodash';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import { Spinner } from 'elemental';
import * as http from '../lib/http';
import groupsJSON from '../../shared/groups.json';

export default React.createClass({

   propTypes: {
      start: React.PropTypes.number,
      end: React.PropTypes.number,
   },

   getDefaultProps() {
      return {
         start: Date.now(),
         end: Date.now(),
      };
   },

   getInitialState() {
      return {
         items: [],
         groups: [],
         volunteers: null,
      };
   },

   componentDidMount() {
      http.get('/api/volunteers')
         .then(({ volunteers }) => this.setState({ volunteers }, this.generateItems));
   },

   generateItems() {
      const groups = groupsJSON.map(name => ({ id: name, title: _.startCase(name) }));
      const items = [];
      const now = new Date();
      const start = new Date(this.props.start);
      const end = new Date(this.props.end);

      _.each(this.state.volunteers, volunteer => _.each(volunteer.availabilities, (av) => {
         const className = new Date(av.from) <= start && new Date(av.till) >= end
            ? new Date(av.confirmationTill) >= now ? 'available' : 'expired'
            : 'unavailable';

         items.push({
            start_time: moment(av.from),
            end_time: moment(av.till),
            id: av._id,
            group: volunteer.group,
            title: 'Name' || `${volunteer.name.first || ''} ${volunteer.name.last || ''}`.trim(),
            className,
         });
      }));

      this.setState({ items, groups });
   },

   render() {
      if (this.state.volunteers === null) {
         return <div style={{ marginTop: 100, textAlign: 'center' }}><Spinner size="lg" /></div>;
      }

      return (
         <Timeline
            groups={this.state.groups}
            items={this.state.items}
            defaultTimeStart={moment(this.props.start).add(-1, 'day')}
            defaultTimeEnd={moment(this.props.end).add(1, 'day')}
            canMove={false}
            canChangeGroup={false}
            canResize={false}
            stackItems
         />
      );
   },

});
