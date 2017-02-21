import React from 'react';
import _ from 'lodash';
import { Card } from 'elemental';
import Mission from './Mission';

export default React.createClass({

   propTypes: {
      missions: React.PropTypes.array,
   },

   getDefaultProps() {
      return {
         missions: [],
      };
   },

   getInitialState() {
      const missions = this.props.missions;

      // coordinates come in in wrong direction, so we have to reverse them
      _.each(missions, (mission) => {
         const location = mission.area.location;
         location.geo = location.geo ? _.reverse(location.geo) : null;
      });

      return { missions };
   },

   render() {
      if (!this.state.missions.length) {
         return <p>You're not on any missions yet.</p>;
      }

      return (
         <div>
            {_.map(this.state.missions, (mission, i) =>
               <Card key={i}>
                  <Mission mission={mission} />
               </Card>
            )}
         </div>
      );
   },

});
