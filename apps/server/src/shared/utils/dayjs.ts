import * as dayjs from "dayjs";
import * as isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

export default dayjs;
