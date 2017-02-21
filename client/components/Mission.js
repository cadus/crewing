import React from 'react';
import _ from 'lodash';
import { Pill } from 'elemental';
import { Map, TileLayer } from 'react-leaflet';
import formatDate from '../lib/formatDate';

export default React.createClass({

   propTypes: {
      mission: React.PropTypes.object.isRequired,
   },

   getDefaultProps() {
      return {
         mission: {},
      };
   },

   getInitialState() {
      return {
         position: this.props.mission.area.location.geo,
         zoom: 10,
      };
   },

   componentDidMount() {

      if (!this.state.position) {
         const location = this.props.mission.area.location;
         const fields = ['country', 'postcode', 'state', 'street1'];
         const query = _.map(_.pick(location, fields), part => part ? part.replace(/\s/g, '+') : '').join(',+');
         const url = `http://nominatim.openstreetmap.org/search?q=${query}&format=json`;
         fetch(url).then(response => response.json()).then((result) => {
            const first = _.first(result) || {};
            const position = [+first.lat, +first.lon];
            this.setState({ position });
         });
      }
   },

   render() {
      const mission = this.props.mission;
      const position = this.state.position;

      return (
         <div>
            <Pill label={mission.status} type="info" style={{ float: 'right' }} />
            <h2>{mission.name} in {mission.area.name} from {formatDate(mission.start)} till {formatDate(mission.end)}</h2>
            <div style={{ marginBottom: '1rem' }}>
               {_.map(mission.crew, (member, i) =>
                  <Pill key={i} label={`${member.name.first} ${member.name.last}`} />
               )}
            </div>
            {position &&
               <Map center={position} zoom={this.state.zoom}>
                  <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
               </Map>
            }
         </div>
      );
   },

});
