import React, { useState, useEffect, useRef } from 'react'
import { i18n } from '../../config_oper';
import { hasArrayData, formatTime, safeArray } from '../../utils/miscutil';
import * as apis from '../../utils/apis'
import { Tabs, Button, Input, InputNumber, Select, Radio, Collapse } from 'antd';
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;
require('./cron.css');

/**
 * 
 * @param {*} props 
 * presetCRONExp 初始cron 默认 "* * * * * ? *"
 * curTimezone 时区，默认8
 * onCRONExpChanged 修改时的回调
 * simpleCfg:{
 *      cronEvery: number
 *      second:1,
 *      minute:1,
 *      hour:1,
 *      day:1,
 *      month:1,
 *      year:1
 * }
 */
function ReactCron(props) {

    const [cron, setCron] = useState(props.presetCRONExp || "* * * * * ? *");
    const [nextScheduleTimes, setNextScheduleTimes] = useState([]);
    const [second, setSecond] = useState({})
    const [minute, setMinute] = useState({})
    const [hour, setHour] = useState({})
    const [day, setDay] = useState({})
    const [week, setWeek] = useState({})
    const [month, setMonth] = useState({})
    const [year, setYear] = useState({})
    const [simpleCfg, setSimpleCfg] = useState({})
    const [isSimple, setIsSimple] = useState(true)
    const currentYear = new Date().getFullYear();
    const sixtys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
    const twentyFours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const everyWeeks = [{ key: "1", val: i18n("cmm_week_sun") }, { key: "2", val: i18n("cmm_week_mon") }, { key: "3", val: i18n("cmm_week_tues") }, { key: "4", val: i18n("cmm_week_wed") }, { key: "5", val: i18n("cmm_week_thur") }, { key: "6", val: i18n("cmm_week_fri") }, { key: "7", val: i18n("cmm_week_sat") }];
    const thirtyOnes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    const twelves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let isMounted = useRef(true);
    useEffect(() => {
        if (JSON.stringify(second) != "{}" && !isSimple) {
            getCron()
        }
    }, [second, minute, hour, day, week, month, year])
    useEffect(() => {
        if (JSON.stringify(simpleCfg) != "{}" && isSimple) {
            getCron()
        }
    }, [simpleCfg])
    useEffect(() => {
        if (props.presetCRONExp) {
            resetHigh(props.presetCRONExp)
            resetSimple(props.presetCRONExp);
        }
        return () => {
            isMounted.current = false;
        }
    }, [])

    const resetHigh = function (data) {
        if (!data || typeof data != "string") return;
        let arr = data.split(" ");
        getDataByText(arr[0], setSecond)
        getDataByText(arr[1], setMinute)
        getDataByText(arr[2], setHour)
        getDataByText(arr[4], setMonth)
        getDataByText(arr[6], setYear)
        getDayByText(arr[3], arr[5])
    }
    const resetSimple = (data) => {
        let arr = data.split(" ");
        let obj = { cronEvery: 0, second: 1, minute: 1, hour: 1, day: 1, dayClock: 0, week: 1, weekClock: 1, month: 1, monthDate: 1, monthClock: 0, year: 1, yearMonth: 1, yearDate: 1, yearClock: 0 }
        if (data.search(/^0\/\d{1,2}(\s\*){4}\s\?\s\*$/) == 0) {
            obj["cronEvery"] = 1;
            obj["second"] = arr[0].split("/")[1]
        } else if (data.search(/^0\s0\/\d{1,2}(\s\*){3}\s\?\s\*$/) == 0) {
            obj["cronEvery"] = 2;
            obj["minute"] = arr[1].split("/")[1]
        } else if (data.search(/^(0\s){2}0\/\d{1,2}(\s\*){2}\s\?\s\*$/) == 0) {
            obj["cronEvery"] = 3;
            obj["hour"] = arr[2].split("/")[1]
        } else if (data.search(/^(0\s){2}\d{1,2}\s1\/\d{1,2}\s\*\s\?\s\*$/) == 0) {
            obj["cronEvery"] = 4;
            obj["day"] = arr[3].split("/")[1]
            obj["dayClock"] = arr[2]
        } else if (data.search(/^(0\s){2}\d{1,2}\s\?\s\*\s\d\s\*$/) == 0) {
            obj["cronEvery"] = 5;
            obj["week"] = Number(arr[5]);
            obj["weekClock"] = arr[2];
        } else if (data.search(/^(0\s){2}(\d{1,2}\s){2}1\/\d{1,2}\s\?\s\*$/) == 0) {
            obj["cronEvery"] = 6;
            obj["month"] = arr[4].split("/")[1];
            obj["monthDate"] = arr[3];
            obj["monthClock"] = arr[2];
        } else if (data.search(/^(0\s){2}(\d{1,2}\s){3}\?\s\d+\/\d{1,2}$/) == 0) {
            obj["cronEvery"] = 7;
            obj["year"] = arr[6].split("/")[1];
            obj["yearMonth"] = arr[4];
            obj["yearDate"] = arr[3];
            obj["yearClock"] = arr[2];
        }
        setSimpleCfg(obj)
    }

    const cloneObj = function (obj) {
        var o;
        if (typeof obj == "object") {
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(cloneObj(obj[i]));
                    }
                } else {
                    o = {};
                    for (var k in obj) {
                        o[k] = cloneObj(obj[k]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    }

    const formatData = (obj) => {
        const cronEvery = obj["cronEvery"];
        if (cronEvery == 2) {
            if (!obj["incrementIncrement"]) obj["incrementIncrement"] = 3
            if (!obj["incrementStart"] && obj["incrementStart"] !== 0) obj["incrementStart"] = 5
        } else if (cronEvery == 3) {
            if (!obj["specificSpecific"] || obj["specificSpecific"].length == 0)
                obj["specificSpecific"] = ["1"]
        } else if (cronEvery == 4) {
            if (!obj["rangeStart"] && obj["rangeStart"] !== 0) obj["rangeStart"] = 3
            if (!obj["rangeEnd"]) obj["rangeEnd"] = 5
        }
    }

    //  second
    const onChangeSecond = (e) => {
        let obj = cloneObj(second);
        obj["cronEvery"] = e.target.value;
        formatData(obj)
        setSecond(obj);
    }
    const onChangeSecondVariable = (value, key) => {
        let obj = cloneObj(second);
        obj[key] = value;
        if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 2
        else if (key == "specificSpecific") obj["cronEvery"] = 3
        else if (key == "rangeStart" || key == "rangeEnd") obj["cronEvery"] = 4
        formatData(obj)
        setSecond(obj);
    }

    // minutes
    const onChangeMinute = (e) => {
        let obj = cloneObj(minute);
        obj["cronEvery"] = e.target.value;
        formatData(obj)
        setMinute(obj);
    }
    const onChangeMinuteVariable = (value, key) => {
        let obj = cloneObj(minute);
        obj[key] = value;
        if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 2
        else if (key == "specificSpecific") obj["cronEvery"] = 3
        else if (key == "rangeStart" || key == "rangeEnd") obj["cronEvery"] = 4
        formatData(obj)
        setMinute(obj);
    }

    // hour
    const onChangeHour = (e) => {
        let obj = cloneObj(hour);
        obj["cronEvery"] = e.target.value;
        formatData(obj)
        setHour(obj);
    }
    const onChangeHourVariable = (value, key) => {
        let obj = cloneObj(hour);
        obj[key] = value;
        if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 2
        else if (key == "specificSpecific") obj["cronEvery"] = 3
        else if (key == "rangeStart" || key == "rangeEnd") obj["cronEvery"] = 4
        formatData(obj)
        setHour(obj);
    }

    // day

    const formatDayData = (obj, weekobj) => {
        const cronEvery = obj["cronEvery"];
        if (cronEvery == 2) {
            if (!weekobj["incrementIncrement"]) weekobj["incrementIncrement"] = 3;
            if (!weekobj["incrementStart"]) weekobj["incrementStart"] = "6";
        } else if (cronEvery == 4) {
            if (!weekobj["specificSpecific"] || weekobj["specificSpecific"].length == 0) weekobj["specificSpecific"] = ["6"];
        } else if (cronEvery == 8) {
            if (!weekobj["cronLastSpecificDomDay"]) weekobj["cronLastSpecificDomDay"] = "6";
        } else if (cronEvery == 9) {
            if (!weekobj["cronNthDayNth"]) weekobj["cronNthDayNth"] = 3;
            if (!weekobj["cronNthDayDay"]) weekobj["cronNthDayDay"] = "6";
        } else if (cronEvery == 3) {
            if (!obj["incrementIncrement"]) obj["incrementIncrement"] = 5;
            if (!obj["incrementStart"]) obj["incrementStart"] = 3;
        } else if (cronEvery == 5) {
            if (!obj["specificSpecific"] || obj["specificSpecific"].length == 0) obj["specificSpecific"] = ["1"]
        }
    }

    const onChangeDay = (e) => {
        let obj = cloneObj(day);
        let weekobj = cloneObj(week);
        obj["cronEvery"] = e.target.value;
        formatDayData(obj, weekobj)
        if (e.target.value == 2 || e.target.value == 4 || e.target.value == 8 || e.target.value == 9) {
            setWeek(weekobj)
        }
        setDay(obj);
    }
    const onChangeDayVariable = (value, key) => {
        let obj = cloneObj(day);
        obj[key] = value;
        if (key == 'specificSpecific') obj["cronEvery"] = 5;
        else if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 3
        formatDayData(obj, {})
        setDay(obj)
    }

    // week
    const onChangeWeekVariable = (value, key) => {
        let obj = cloneObj(week);
        let objDay = cloneObj(day);
        obj[key] = value;
        if ((key == "incrementStart" || key == "incrementIncrement") && day["cronEvery"] != 2) {
            objDay["cronEvery"] = 2;
        } else if (key == "specificSpecific" && day["cronEvery"] != 4) {
            objDay["cronEvery"] = 4;
        } else if (key == "cronLastSpecificDomDay" && day["cronEvery"] != 8) {
            objDay["cronEvery"] = 8;
        } else if ((key == "cronNthDayDay" || key == "cronNthDayNth") && day["cronEvery"] != 9) {
            objDay["cronEvery"] = 9;
        }
        formatDayData(objDay, obj)
        setDay(objDay)
        setWeek(obj)
    }

    // month

    const onChangeMonth = (e) => {
        let obj = cloneObj(month);
        obj["cronEvery"] = e.target.value;
        formatData(obj)
        setMonth(obj);
    }
    const onChangeMonthVariable = (value, key) => {
        let obj = cloneObj(month);
        obj[key] = value;
        if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 2
        else if (key == "specificSpecific") obj["cronEvery"] = 3
        else if (key == "rangeStart" || key == "rangeEnd") obj["cronEvery"] = 4
        formatData(obj)
        setMonth(obj);
    }

    // year

    // year
    const formatYearData = (obj) => {
        const cronEvery = obj["cronEvery"];
        if (cronEvery == 2) {
            if (!obj["incrementIncrement"]) obj["incrementIncrement"] = 3
            if (!obj["incrementStart"]) obj["incrementStart"] = currentYear
        } else if (cronEvery == 3) {
            if (!obj["specificSpecific"] || obj["specificSpecific"].length == 0)
                obj["specificSpecific"] = [String(currentYear)]
        } else if (cronEvery == 4) {
            if (!obj["rangeStart"]) obj["rangeStart"] = currentYear
            if (!obj["rangeEnd"]) obj["rangeEnd"] = currentYear
        }
    }

    const onChangeYear = (e) => {
        let obj = cloneObj(year);
        obj["cronEvery"] = e.target.value;
        formatYearData(obj)
        setYear(obj);
    }
    const onChangeYearVariable = (value, key) => {
        let obj = cloneObj(year);
        obj[key] = value;
        if (key == "incrementIncrement" || key == "incrementStart") obj["cronEvery"] = 2
        else if (key == "specificSpecific") obj["cronEvery"] = 3
        else if (key == "rangeStart" || key == "rangeEnd") obj["cronEvery"] = 4
        formatYearData(obj)
        setYear(obj);
    }

    // simple
    const onChangeSimpleCfg = (e) => {
        let obj = cloneObj(simpleCfg);
        obj["cronEvery"] = e.target.value;
        setSimpleCfg(obj);
    }
    const onChangeSimpleCfgVariable = (value, key) => {
        let obj = cloneObj(simpleCfg);
        obj[key] = value;
        switch (key) {
            case "second":
                obj["cronEvery"] = 1;
                break;
            case "minute":
                obj["cronEvery"] = 2;
                break;
            case "hour":
                obj["cronEvery"] = 3;
                break;
            case "day":
            case "dayClock":
                obj["cronEvery"] = 4;
                break;
            case "week":
            case "weekClock":
                obj["cronEvery"] = 5;
                break;
            case "month":
            case "monthDate":
            case "monthClock":
                obj["cronEvery"] = 6;
                break;
            case "year":
            case "yearMonth":
            case "yearDate":
            case "yearClock":
                obj["cronEvery"] = 7;
                break;
        }
        setSimpleCfg(obj);
    }
    // to text
    const daysText = function () {
        let days = '';
        let cronEvery = day.cronEvery || "";
        switch (cronEvery.toString()) {
            case '1':
                break;
            case '2':
            case '4':
            case '8':
            case '9':
                days = '?';
                break;
            case '3':
                days = day.incrementStart + '/' + day.incrementIncrement;
                break;
            case '5':
                days = day.specificSpecific.join(',');
                break;
            case '6':
                days = "L";
                break;
            case '7':
                days = "LW";
                break;
        }
        return days;
    }
    const weeksText = function () {
        let weeks = '';
        let cronEvery = day.cronEvery || "";
        switch (cronEvery.toString()) {
            case '1':
            case '3':
            case '5':
            case '6':
            case '7':
                weeks = '?';
                break;
            case '2':
                weeks = week.incrementStart + '/' + week.incrementIncrement;
                break;
            case '4':
                weeks = week.specificSpecific.join(',');
                break;
            case '8':
                weeks = week.cronLastSpecificDomDay + 'L';
                break;
            case '9':
                weeks = week.cronNthDayDay + "#" + week.cronNthDayNth;
                break;
        }
        return weeks;
    }
    const getText = (data) => {
        let cronEvery = data.cronEvery || "";
        switch (cronEvery.toString()) {
            case '1':
                return '*';
            case '2':
                return data.incrementStart + '/' + data.incrementIncrement;
            case '3':
                return data.specificSpecific.join(',');
            case '4':
                return data.rangeStart + '-' + data.rangeEnd;
        }
    }
    // to data
    /**
     * 
     * @param {*} text 单个单位的字符串信息 支持 second/minute/hour/month/year
     * @param {*} setData 修改数据的方法 如：setSecond
     */
    const getDataByText = (text, setData) => {
        let data = {
            cronEvery: 1,
            incrementStart: '',
            incrementIncrement: '',
            rangeStart: '',
            rangeEnd: '',
            specificSpecific: [],
        }
        if (typeof text == 'string') {
            if (text.indexOf('/') > -1) {
                let arr = text.split('/');
                data["incrementStart"] = arr[0];
                data["incrementIncrement"] = arr[1]
                data["cronEvery"] = 2
            } else if (text.indexOf(",") > -1 || !isNaN(text)) {
                data["specificSpecific"] = text.split(",")
                data["cronEvery"] = 3
            } else if (text.indexOf('-') > -1) {
                let arr = text.split('-');
                data["rangeStart"] = arr[0];
                data["rangeEnd"] = arr[1]
                data["cronEvery"] = 4
            }
        }
        setData(data)
    }

    const getDayByText = (textDay, textWeek) => {
        textDay = textDay || "?";
        textWeek = textWeek || "?";
        let day = {
            cronEvery: 1,
            incrementStart: '',
            incrementIncrement: '',
            rangeStart: '',
            rangeEnd: '',
            specificSpecific: [],
            cronDaysBeforeEomMinus: '',
            cronDaysNearestWeekday: '',
        }
        let week = {
            cronEvery: '',
            incrementStart: '',
            incrementIncrement: '',
            specificSpecific: [],
            cronLastSpecificDomDay: '',
            cronNthDayDay: '',
            cronNthDayNth: '',
        }
        if (textDay == "?") {
            if (textWeek.indexOf("/") > -1) {
                day["cronEvery"] = 2;
                let arr = textWeek.split("/");
                week["incrementStart"] = arr[0];
                week["incrementIncrement"] = arr[1]
            } else if (textWeek.indexOf(",") > -1 || !isNaN(textWeek)) {
                day["cronEvery"] = 4;
                week["specificSpecific"] = safeArray(textWeek.split(","))
            } else if (textWeek.indexOf("L") > -1) {
                day["cronEvery"] = 8;
                week["cronLastSpecificDomDay"] = textWeek.replace("L", "");
            } else if (textWeek.indexOf("#")) {
                day["cronEvery"] = 9;
                let arr = textWeek.split("#");
                week["cronNthDayDay"] = arr[0];
                week["cronNthDayNth"] = arr[1]
            }
        } else if (textWeek == "?") {
            if (textDay.indexOf("/") > -1) {
                let arr = textDay.split("/");
                day["cronEvery"] = 3;
                day["incrementStart"] = arr[0];
                day["incrementIncrement"] = arr[1]
            } else if (textDay.indexOf(",") > -1 || !isNaN(textDay)) {
                day["cronEvery"] = 5;
                day["specificSpecific"] = textDay.split(",")
            } else if (textDay == "L") {
                day["cronEvery"] = 6;
            } else if (textDay == "LW") {
                day["cronEvery"] = 7;
            }
        }
        setDay(day);
        setWeek(week);
    }

    const getCron = function () {
        let cronStr = cron;
        if (isSimple) {
            let cronEvery = simpleCfg.cronEvery
            if (cronEvery == 1) {
                cronStr = `0/${simpleCfg.second || 1} * * * * ? *`
            } else if (cronEvery == 2) {
                cronStr = `0 0/${simpleCfg.minute || 1} * * * ? *`
            } else if (cronEvery == 3) {
                cronStr = `0 0 0/${simpleCfg.hour || 1} * * ? *`
            } else if (cronEvery == 4) {
                cronStr = `0 0 ${simpleCfg.dayClock || 0} 1/${simpleCfg.day || 1} * ? *`
            } else if (cronEvery == 5) {
                cronStr = `0 0 ${simpleCfg.weekClock || 0} ? * ${simpleCfg.week || 1} *`
            } else if (cronEvery == 6) {
                cronStr = `0 0 ${simpleCfg.monthClock || 0} ${simpleCfg.monthDate || 1} 1/${simpleCfg.month || 1} ? *`
            } else if (cronEvery == 7) {
                cronStr = `0 0 ${simpleCfg.yearClock || 0} ${simpleCfg.yearDate || 1} ${simpleCfg.yearMonth || 1} ? ${currentYear}/${simpleCfg.year || 1}`
            }
        } else {
            cronStr = `${getText(second) || '*'} ${getText(minute) || '*'} ${getText(hour) || '*'} ${daysText() || '*'} ${getText(month) || '*'} ${weeksText() || '?'} ${getText(year) || '*'}`
        }
        if (cronStr == cron) return;
        if (props.onCRONExpChanged) {
            props.onCRONExpChanged(cronStr)
        }
        setCron(cronStr)
    }

    const onchangeConfigType = function (key) {
        if (key == 1) {
            resetSimple(cron)
            setTimeout(() => {
                setIsSimple(true)
            })
        } else {
            resetHigh(cron);
            setTimeout(() => {
                setIsSimple(false);
            })

        }
    }
    const checkScheduleTime = () => {
        let curTimezone = props.curTimezone;
        apis.GetCronNextScheduleTimes({ cron: cron, tmzone: curTimezone }, (code, rOrM) => {
            if (!isMounted.current) return;
            if (code == 0) {
                if (hasArrayData(rOrM)) {
                    setNextScheduleTimes(rOrM)
                } else {
                    setNextScheduleTimes(i18n("sch_cron_empty_time"))
                }
            } else {
                setNextScheduleTimes(rOrM)
            }
        })
    }
    const renderNextScheduleTimes = (nextScheduleTimes) => {
        if (hasArrayData(nextScheduleTimes)) {
            return <div className="sch-show-cron-time">
                {nextScheduleTimes.map(time => {
                    if (typeof time == "number") {
                        let date = new Date(time * 1000);
                        return <p key={time}>{formatTime(date)}</p>
                    }
                    return null
                })}
            </div>
        } else if (nextScheduleTimes) {
            return <div className="sch-show-cron-time">
                <p>{nextScheduleTimes}</p>
            </div>
        } else {
            return <div className="sch-show-cron-time"> </div>
        }
    }

    const renderSimpleConfig = () => {
        return <div className="">
            <Radio.Group onChange={onChangeSimpleCfg} value={simpleCfg.cronEvery} >
                <div className='cron-tab-row' >
                    <Radio value={1} >
                        {/* 每 n 秒执行一次 */}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={59} value={simpleCfg.second} onChange={(value) => onChangeSimpleCfgVariable(value, 'second')} />
                        {i18n("cmm_time_s")}{i18n("sch_perform_once")}
                    </Radio>
                </div>
                <div className='cron-tab-row' >
                    <Radio value={2} >
                        {/* 每 n 分执行一次 */}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={59} value={simpleCfg.minute} onChange={(value) => onChangeSimpleCfgVariable(value, 'minute')} />
                        {i18n("cmm_time_m")}{i18n("sch_perform_once")}
                    </Radio>
                </div>
                <div className='cron-tab-row' >
                    <Radio value={3} >
                        {/* 每 n 小时执行一次 */}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={23} value={simpleCfg.hour} onChange={(value) => onChangeSimpleCfgVariable(value, 'hour')} />
                        {i18n("cmm_time_h")}{i18n("sch_perform_once")}
                    </Radio>
                </div>
                <div className='cron-tab-row' >
                    <Radio value={4} >
                        {/* 每 n 天执行一次，m点 */}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={30} value={simpleCfg.day} onChange={(value) => onChangeSimpleCfgVariable(value, 'day')} />
                        {i18n("cmm_time_day")}{i18n("sch_perform_once")}
                        <InputNumber className="cron-tab-row-number" min={0} max={23} formatter={value => `${value} ${i18n("cmm_time_clock")}`} value={simpleCfg.dayClock} onChange={(value) => onChangeSimpleCfgVariable(value, 'dayClock')} />
                    </Radio>
                </div>
                <div className='cron-tab-row' >
                    <Radio value={5} >
                        {/* 每 周n 天执行一次 m 点*/}
                        {i18n("sch_per")}
                    </Radio>
                    <Select style={{ width: 200 }} value={simpleCfg.week} allowClear onChange={(value) => onChangeSimpleCfgVariable(value, 'week')} >
                        {everyWeeks.map(item => <Option key={item.key} value={item.key} >{item.val}</Option>)}
                    </Select>
                    <InputNumber className="cron-tab-row-number" min={0} max={23} formatter={value => `${value} ${i18n("cmm_time_clock")}`} value={simpleCfg.weekClock} onChange={(value) => onChangeSimpleCfgVariable(value, 'weekClock')} />
                </div>
                <div className='cron-tab-row' >
                    <Radio value={6} >
                        {/* 每 n 月执行一次  m 号, o 点*/}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={11} value={simpleCfg.month} onChange={(value) => onChangeSimpleCfgVariable(value, 'month')} />
                        {i18n("cmm_time_month")}
                        {i18n("sch_perform_once")}
                        <InputNumber className="cron-tab-row-number" min={1} max={31} formatter={value => `${value} ${i18n("cmm_day")}`} value={simpleCfg.monthDate} onChange={(value) => onChangeSimpleCfgVariable(value, 'monthDate')} />
                        <InputNumber className="cron-tab-row-number" min={0} max={23} formatter={value => `${value} ${i18n("cmm_time_clock")}`} value={simpleCfg.monthClock} onChange={(value) => onChangeSimpleCfgVariable(value, 'monthClock')} />
                    </Radio>
                </div>
                <div className='cron-tab-row' >
                    <Radio value={7} >
                        {/* 每 n 年执行一次  m 月 o 号 , q 点*/}
                        {i18n("sch_per")}
                        <InputNumber className="cron-tab-row-number" min={1} max={11} value={simpleCfg.year} onChange={(value) => onChangeSimpleCfgVariable(value, 'year')} />
                        {i18n("cmm_time_year")}
                        {i18n("sch_perform_once")}
                        <InputNumber className="cron-tab-row-number" min={1} max={12} formatter={value => `${value} ${i18n("cmm_time_month")}`} value={simpleCfg.yearMonth} onChange={(value) => onChangeSimpleCfgVariable(value, 'yearMonth')} />
                        <InputNumber className="cron-tab-row-number" min={1} max={31} formatter={value => `${value} ${i18n("cmm_day")}`} value={simpleCfg.yearDate} onChange={(value) => onChangeSimpleCfgVariable(value, 'yearDate')} />
                        <InputNumber className="cron-tab-row-number" min={0} max={23} formatter={value => `${value} ${i18n("cmm_time_clock")}`} value={simpleCfg.yearClock} onChange={(value) => onChangeSimpleCfgVariable(value, 'yearClock')} />
                    </Radio>
                </div>
            </Radio.Group>
        </div>
    }
    const renderHighConfig = () => {
        return <Tabs
            defaultActiveKey="second"
            animated={true}
            className="cron-contab-cont"
        >
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_s')}</span>} key="second">
                <Radio.Group onChange={onChangeSecond} value={second.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_s")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={60} value={second.incrementIncrement} onChange={(value) => onChangeSecondVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_s")}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={second.incrementStart} onChange={(value) => onChangeSecondVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_s")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3}>
                            {i18n("sch_specific_second")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={second.specificSpecific} allowClear onChange={(value) => onChangeSecondVariable(value, 'specificSpecific')} >
                            {sixtys.map(item => <Option key={item}>{item}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_round_from")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={second.rangeStart} onChange={(value) => onChangeSecondVariable(value, 'rangeStart')} />
                            {i18n("cmm_to")}
                            <InputNumber className="cron-tab-row-number" min={1} max={59} value={second.rangeEnd} onChange={(value) => onChangeSecondVariable(value, 'rangeEnd')} />
                            {i18n("cmm_time_s")}
                        </Radio>
                    </div>
                </Radio.Group>
            </TabPane >
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_m')}</span>} key="minute">
                <Radio.Group onChange={onChangeMinute} value={minute.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_m")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={60} value={minute.incrementIncrement} onChange={(value) => onChangeMinuteVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_m")}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={minute.incrementStart} onChange={(value) => onChangeMinuteVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_m")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3}>
                            {i18n("sch_specific_minute")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={minute.specificSpecific} allowClear onChange={(value) => onChangeMinuteVariable(value, 'specificSpecific')} >
                            {sixtys.map(item => <Option key={item}>{item}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_round_from")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={minute.rangeStart} onChange={(value) => onChangeMinuteVariable(value, 'rangeStart')} />
                            {i18n("cmm_to")}
                            <InputNumber className="cron-tab-row-number" min={1} max={59} value={minute.rangeEnd} onChange={(value) => onChangeMinuteVariable(value, 'rangeEnd')} />
                            {i18n("cmm_time_m")}
                        </Radio>
                    </div>
                </Radio.Group>
            </TabPane>
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_h')}</span>} key="hour">
                <Radio.Group onChange={onChangeHour} value={hour.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_h")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={60} value={hour.incrementIncrement} onChange={(value) => onChangeHourVariable(value, 'incrementIncrement')} />
                            {i18n('cmm_time_h')}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={hour.incrementStart} onChange={(value) => onChangeHourVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_h")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3}>
                            {i18n("sch_specific_hour")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={hour.specificSpecific} allowClear onChange={(value) => onChangeHourVariable(value, 'specificSpecific')} >
                            {twentyFours.map(item => <Option key={item}>{item}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_round_from")}
                            <InputNumber className="cron-tab-row-number" min={0} max={59} value={hour.rangeStart} onChange={(value) => onChangeHourVariable(value, 'rangeStart')} />
                            {i18n("cmm_to")}
                            <InputNumber className="cron-tab-row-number" min={1} max={59} value={hour.rangeEnd} onChange={(value) => onChangeHourVariable(value, 'rangeEnd')} />
                            {i18n("cmm_time_h")}
                        </Radio>
                    </div>
                </Radio.Group>
            </TabPane>
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_time_day')}</span>} key="day">
                <Radio.Group onChange={onChangeDay} value={day.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_day")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={4} value={week.incrementIncrement} onChange={(value) => onChangeWeekVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_week")}{i18n("sch_start_at")}
                        </Radio>
                        <Select style={{ width: 200 }} value={week.incrementStart} allowClear onChange={(value) => onChangeWeekVariable(value, 'incrementStart')} >
                            {everyWeeks.map(item => <Option key={item.key} value={item.key} >{item.val}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={31} value={day.incrementIncrement} onChange={(value) => onChangeDayVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_day")}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={1} max={31} value={day.incrementStart} onChange={(value) => onChangeDayVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_day")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_specific_week")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={week.specificSpecific} allowClear onChange={(value) => onChangeWeekVariable(value, 'specificSpecific')} >
                            {everyWeeks.map(item => <Option key={item.key} value={item.key} >{item.val}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={5}>
                            {i18n("sch_specific_day")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={day.specificSpecific} allowClear onChange={(value) => onChangeDayVariable(value, 'specificSpecific')} >
                            {thirtyOnes.map(item => <Option key={item}>{item}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={6} >{i18n("sch_last_day_for_month")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={7} >{i18n("sch_last_day_for_weekday")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={8} >{i18n("sch_last_day")} </Radio>
                        <Select style={{ width: 200 }} value={week.cronLastSpecificDomDay} allowClear onChange={(value) => onChangeWeekVariable(value, 'cronLastSpecificDomDay')} >
                            {everyWeeks.map(item => <Option key={item.key} value={item.key} >{item.val}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={9} >
                            {i18n("sch_on_the_day")}
                            <InputNumber className="cron-tab-row-number" min={1} max={5} value={week.cronNthDayNth} onChange={(value) => onChangeWeekVariable(value, 'cronNthDayNth')} />
                            {i18n("sch_the_month")}
                        </Radio>
                        <Select style={{ width: 200 }} value={week.cronNthDayDay} allowClear onChange={(value) => onChangeWeekVariable(value, 'cronNthDayDay')} >
                            {everyWeeks.map(item => <Option key={item.key} value={item.key} >{item.val}</Option>)}
                        </Select>
                    </div>
                </Radio.Group>
            </TabPane>
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_time_month')}</span>} key="month">
                <Radio.Group onChange={onChangeMonth} value={month.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_month")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={12} value={month.incrementIncrement} onChange={(value) => onChangeMonthVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_month")}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={1} max={12} value={month.incrementStart} onChange={(value) => onChangeMonthVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_month")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3}>
                            {i18n("sch_specific_month")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={month.specificSpecific} allowClear onChange={(value) => onChangeMonthVariable(value, 'specificSpecific')} >
                            {twelves.map(item => <Option key={item}>{item}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_round_from")}
                            <InputNumber className="cron-tab-row-number" min={1} max={12} value={month.rangeStart} onChange={(value) => onChangeMonthVariable(value, 'rangeStart')} />
                            {i18n("cmm_to")}
                            <InputNumber className="cron-tab-row-number" min={1} max={12} value={month.rangeEnd} onChange={(value) => onChangeMonthVariable(value, 'rangeEnd')} />
                            {i18n("cmm_time_month")}
                        </Radio>
                    </div>
                </Radio.Group>
            </TabPane>
            <TabPane tab={<span className="cron-tab-pane-span">{i18n('cmm_time_year')}</span>} key="year" >
                <Radio.Group onChange={onChangeYear} value={year.cronEvery} >
                    <div className='cron-tab-row' >
                        <Radio value={1} >{i18n("sch_per_year")}</Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={2} >
                            {i18n("sch_per")}
                            <InputNumber className="cron-tab-row-number" min={1} max={60} value={year.incrementIncrement} onChange={(value) => onChangeYearVariable(value, 'incrementIncrement')} />
                            {i18n("cmm_time_year")}{i18n("sch_start_at")}
                            <InputNumber className="cron-tab-row-number" min={currentYear} max={currentYear + 60} value={year.incrementStart} onChange={(value) => onChangeYearVariable(value, 'incrementStart')} />
                            {i18n("cmm_time_year")}
                        </Radio>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={3}>
                            {i18n("sch_specific_year")}
                        </Radio>
                        <Select style={{ width: "340px" }} mode="multiple" value={year.specificSpecific} allowClear onChange={(value) => onChangeYearVariable(value, 'specificSpecific')} >
                            {sixtys.map((item, idx) => <Option key={idx + currentYear}>{idx + currentYear}</Option>)}
                        </Select>
                    </div>
                    <div className='cron-tab-row' >
                        <Radio value={4}>
                            {i18n("sch_round_from")}
                            <InputNumber className="cron-tab-row-number" min={currentYear} max={currentYear + 59} value={year.rangeStart} onChange={(value) => onChangeYearVariable(value, 'rangeStart')} />
                            {i18n("cmm_to")}
                            <InputNumber className="cron-tab-row-number" min={currentYear} max={currentYear + 60} value={year.rangeEnd} onChange={(value) => onChangeYearVariable(value, 'rangeEnd')} />
                            {i18n("cmm_time_year")}
                        </Radio>
                    </div>
                </Radio.Group>
            </TabPane>

        </Tabs >
    }
    return <div className="cron-contab">
        <div className="cron-contab-input">
            {i18n('sch_expression')}{i18n('cmm_colon')}
            <Input type='text' value={cron} />
        </div>
        <Collapse className="cron-collapse" accordion defaultActiveKey="1" onChange={onchangeConfigType}>
            <Panel header={i18n("sch_simple_config")} key="1">
                {renderSimpleConfig()}
            </Panel>
            <Panel header={i18n("sch_high_config")} key="2">
                {renderHighConfig()}
            </Panel>
        </Collapse>

        <div className="cron-show">
            <div>
                {i18n("sch_cron_time_5")}
                <Button onClick={checkScheduleTime} >{i18n("cmm_view")}</Button>
            </div>
            {renderNextScheduleTimes(nextScheduleTimes)}
            <p style={{ color: 'red' }}>{i18n('sch_note')}</p>
        </div>
    </div >
}

export default ReactCron
