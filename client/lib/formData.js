// From https://github.com/nervgh/recursive-iterator/wiki/Cookbook-(es6)#to-form-data

import _ from 'lodash';
import RecursiveIterator from 'recursive-iterator';

const { FormData } = window;
const { toString } = Object.prototype;


/**
 * Returns type of anything
 * @param {Object} any
 * @returns {String}
 */
function getType(any) {
   return toString.call(any).slice(8, -1);
}
/**
 * Converts path to FormData name
 * @param {Array} path
 * @returns {String}
 */
function toName(path) {
   const array = path.map(part => `[${part}]`);
   array[0] = path[0];
   return array.join('');
}

/**
 * Converts object to FormData
 * @param {Object} object
 * @returns {FormData}
 */
export default (object) => {
   if (!_.isObject(object)) {
      throw new TypeError('Argument must be object');
   }

   const form = new FormData();
   const iterator = new RecursiveIterator(object, 0, true);

   const appendToForm = (path, node, filename) => {
      const name = toName(path);
      if (_.isUndefined(filename)) {
         form.append(name, node);
      }
      else {
         form.append(name, node, filename);
      }
   };

   iterator.onStepInto = ({ node }) => {
      const type = getType(node);
      switch (type) {
         case 'Array':
            return true; // step into
         case 'Object':
            return true; // step into
         case 'FileList':
            return true; // step into
         default:
            return false; // prevent step into
      }
   };

   for(const { node, path } of iterator) {
      const type = getType(node);
      switch (type) {
         case 'Array':
            break;
         case 'Object':
            break;
         case 'FileList':
            break;
         case 'File':
            appendToForm(path, node);
            break;
         case 'Blob':
            appendToForm(path, node, node.name);
            break;
         default:
            appendToForm(path, node);
            break;
      }
   }

   return form;
};
