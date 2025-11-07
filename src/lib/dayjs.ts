import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';

dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.locale('ja');

export default dayjs;
