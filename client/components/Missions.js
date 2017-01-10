import React from 'react';
import { Table } from 'elemental';

export default React.createClass({

   propTypes: {
      missions: React.PropTypes.array,
   },

   getDefaultProps() {
      return {
         missions: [],
      };
   },

   render() {
      return (
         <Table>
            <thead>
               <tr>
                  <th>Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
               </tr>
            </thead>
            <tbody>
               {this.props.missions.map(mission =>
                  <tr key={mission.id}>
                     <td>{mission.name}</td>
                     <td>{mission.start}</td>
                     <td>{mission.end}</td>
                     <td>{mission.status}</td>
                  </tr>
               )}
            </tbody>
         </Table>
      );
   },

});
