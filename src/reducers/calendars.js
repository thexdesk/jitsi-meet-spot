import { isValidMeetingUrl } from 'utils';

const DEFAULT_STATE = {
    name: undefined,
    displayName: undefined,
    events: []
};

export const CALENDAR_SET_ACCOUNT = 'CALENDAR_SET_ACCOUNT';
export const CALENDAR_SET_EVENTS = 'CALENDAR_SET_EVENTS';

/**
 * A {@code Reducer} to update the current Redux state for the 'calendar'
 * feature. The 'calendar' feature stores the calendar from which to fetch
 * events and the events themselves.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 */
const calendar = (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case CALENDAR_SET_ACCOUNT:
        return {
            ...state,
            displayName: action.displayName,
            email: action.email,
            events: []
        };

    case CALENDAR_SET_EVENTS:
        return {
            ...state,
            events:
                filterJoinableEvents(state.events, action.events, state.email)
        };

    default:
        return state;
    }
};

/**
 * Removes the currently configured calendar from the attendees.
 *
 * @param {Array<Object>} attendees
 * @param {string} currentCalendar
 */
function filterAttendees(attendees = [], currentCalendar) {
    const otherAttendees = attendees.filter(attendee =>
        attendee.email !== currentCalendar);

    return otherAttendees.map(attendee => {
        return {
            email: attendee.email
        };
    });
}

/**
 * Converts the passed in events into a standard format expected by the
 * application.
 *
 * @param {Array<Object>} currentEvents
 * @param {Array<Object>} newEvents
 * @param {string} currentCalendar
 */
function filterJoinableEvents(currentEvents, newEvents = [], currentCalendar) {
    // TODO do not create new objects if unnecessary. Right now a new array is
    // created with each call, causing unnecessary re-renders.
    const events = newEvents.map(event => {
        const { attendees, location, end, id, start, summary } = event;
        const meetingUrl = getMeetingUrl(location);

        return {
            end: end.dateTime,
            id,
            meetingUrl: isValidMeetingUrl(meetingUrl) ? meetingUrl : null,
            meetingName: getMeetingName(location),
            participants: filterAttendees(attendees, currentCalendar),
            start: start.dateTime,
            title: summary
        };
    });

    return events;
}

/**
 * Extrapolates the name for a jitsi meeting from a given string.
 *
 * @param {string} location - A string which may contain a url to a jitsi
 * meeting.
 * @private
 * @returns {string}
 */
function getMeetingName(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    if (!matches || matches.length < 2) {
        return;
    }

    // eslint-disable-next-line no-useless-escape
    return matches[1].replace(/,\s*$/, '');
}

/**
 * Extrapolates a url for a jitsi meeting from a given string.
 *
 * @param {string} location - A string which may contains a jitsi meeting url.
 * @private
 * @returns {string}
 */
function getMeetingUrl(location) {
    // eslint-disable-next-line no-useless-escape
    const linkRegex = /https?:\/\/[^\s]+\/([^\s\/]+)/g;
    const matches = linkRegex.exec(location);

    if (!matches || !matches.length) {
        return;
    }

    // eslint-disable-next-line no-useless-escape
    return matches[0].replace(/,\s*$/, '');
}

/**
 * A selector which returns the email associated with the currently configured
 * calendar.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getCalendarEmail(state) {
    return state.calendars.email;
}

/**
 * A selector which returns calendar events associated with the currently
 * configured calendar.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<Object>}
 */
export function getCalendarEvents(state) {
    return state.calendars.events;
}

/**
 * A selector which returns the name to show associated with the currently
 * configured calendar.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getDisplayName(state) {
    return state.calendars.displayName;
}

export default calendar;
