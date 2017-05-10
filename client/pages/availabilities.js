import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import Availabilities from '../components/Availabilities';

const parsed = queryString.parse(window.location.search);
const start = +parsed.start || Date.now();
const end = +parsed.end || Date.now();

ReactDOM.render(<Availabilities start={start} end={end} />, document.getElementById('app'));
