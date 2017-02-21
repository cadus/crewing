export default function (isoDateString) {
   const date = new Date(isoDateString);
   const month = (date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1);
   const day = (date.getDate() > 9 ? '' : '0') + date.getDate();
   return `${date.getFullYear()}-${month}-${day}`; // 2016-12-23
}
