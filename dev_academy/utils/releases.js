import { __ } from '@wordpress/i18n';

export const releaseSummary = {
	version: '4.0.0',
	addons: {
		label: __('Dashboard Views', 'academy'),
		count: '3',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="34"
				height="34"
				viewBox="0 0 34 34"
				fill="none"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M15.9269 4.84819C15.9263 4.11627 15.6353 3.41448 15.1178 2.89693C14.6002 2.37938 13.8984 2.08838 13.1665 2.08782H4.88538C4.15345 2.08838 3.45167 2.37938 2.93412 2.89693C2.41657 3.41448 2.12556 4.11627 2.125 4.84819V13.1293C2.12556 13.8612 2.41657 14.563 2.93412 15.0806C3.45167 15.5981 4.15345 15.8891 4.88538 15.8897H13.1665C13.8984 15.8891 14.6002 15.5981 15.1178 15.0806C15.6353 14.563 15.9263 13.8612 15.9269 13.1293V4.84819ZM15.9269 20.7857C15.9263 20.0538 15.6353 19.352 15.1178 18.8344C14.6002 18.3169 13.8984 18.0259 13.1665 18.0253H4.88538C4.15345 18.0259 3.45167 18.3169 2.93412 18.8344C2.41657 19.352 2.12556 20.0538 2.125 20.7857V29.0668C2.12556 29.7987 2.41657 30.5005 2.93412 31.0181C3.45167 31.5356 4.15345 31.8266 4.88538 31.8272H13.1665C13.8984 31.8266 14.6002 31.5356 15.1178 31.0181C15.6353 30.5005 15.9263 29.7987 15.9269 29.0668V20.7857ZM31.8644 20.7857C31.8638 20.0538 31.5728 19.352 31.0553 18.8344C30.5377 18.3169 29.8359 18.0259 29.104 18.0253H20.8229C20.091 18.0259 19.3892 18.3169 18.8716 18.8344C18.3541 19.352 18.0631 20.0538 18.0625 20.7857V29.0668C18.0631 29.7987 18.3541 30.5005 18.8716 31.0181C19.3892 31.5356 20.091 31.8266 20.8229 31.8272H29.104C29.8359 31.8266 30.5377 31.5356 31.0553 31.0181C31.5728 30.5005 31.8638 29.7987 31.8644 29.0668V20.7857ZM26.8951 2.88363C26.3815 2.37054 25.6852 2.08234 24.9592 2.08234C24.2332 2.08234 23.5369 2.37054 23.0233 2.88363L18.8583 7.04969C18.345 7.56298 18.0567 8.25914 18.0567 8.98504C18.0567 9.71093 18.345 10.4071 18.8583 10.9204L23.0233 15.0864C23.5368 15.5998 24.2331 15.8882 24.9592 15.8882C25.6853 15.8882 26.3816 15.5998 26.8951 15.0864L31.0601 10.9214C31.3144 10.6673 31.5161 10.3655 31.6538 10.0333C31.7914 9.70115 31.8622 9.34512 31.8622 8.98557C31.8622 8.62601 31.7914 8.26998 31.6538 7.93782C31.5161 7.60566 31.3144 7.30386 31.0601 7.04969L26.8951 2.88363Z"
					fill="#7B68EE"
				/>
			</svg>
		),
	},
	bugFixes: {
		label: __('Bug Fixes', 'academy'),
		count: '40+',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
			>
				<g clipPath="url(#clip0_12387_6614)">
					<path
						d="M30.0114 22.7879C28.7993 21.6243 27.1508 21.2849 25.5993 21.8182L19.0538 15.4667C19.5871 13.8667 19.1993 12.2667 17.9871 11.1031C17.0659 10.1819 15.8053 9.69702 14.4962 9.69702C13.575 9.69702 13.1387 10.8122 13.8174 11.4425L15.5144 13.091C15.8538 13.4304 15.8538 13.9152 15.5144 14.2546L14.1568 15.6607C13.8659 16.0001 13.2841 16.0001 12.9932 15.6607L11.2962 14.0122C10.9084 13.6243 10.2296 13.6243 9.84169 14.0122C9.64775 14.2061 9.55078 14.4485 9.55078 14.7394C9.59927 16.0001 10.0841 17.2122 11.0053 18.1334C12.169 19.3455 13.9144 19.6364 15.4659 19.1516L22.0114 25.5031C21.5265 27.1031 21.9629 28.8485 23.1265 29.9637C24.0478 30.8364 25.2599 31.3213 26.5205 31.3213H26.569C27.4902 31.3213 27.8781 30.2061 27.2478 29.5758L25.5508 27.9273C25.2114 27.5879 25.2114 27.1031 25.5023 26.7637L26.8599 25.3576C27.1508 25.0182 27.6841 25.0182 28.0235 25.3576L29.7205 27.0061C30.3023 27.5879 31.4659 27.2001 31.4659 26.2788C31.4659 24.9213 30.9326 23.7091 30.0114 22.7879Z"
						fill="#7B68EE"
					/>
					<path
						d="M8.48403 14.497C8.48403 11.3939 11.0052 8.82423 14.1083 8.72726C15.1749 8.48483 17.2113 8.96968 18.6658 10.3757C20.0234 11.6848 20.5083 13.3818 20.1689 15.1757L23.8052 18.7151C23.9992 18.3273 24.1446 17.8909 24.2416 17.503L27.6355 17.1636C27.878 17.1636 28.0719 16.9212 28.0719 16.6788V12.3151C28.0719 12.0727 27.878 11.8788 27.6355 11.8303L24.2416 11.4909C24.0477 10.8121 23.7568 10.1818 23.4659 9.5515L25.5992 6.93332C25.7446 6.73938 25.7446 6.44847 25.5507 6.30301L22.4477 3.19998C22.2537 3.00604 22.0113 3.00604 21.8174 3.1515L19.1992 5.33332C18.5689 4.99392 17.9386 4.7515 17.2598 4.50908L16.9204 1.11514C16.9204 0.872711 16.678 0.678772 16.4355 0.678772H12.0719C11.8295 0.678772 11.6355 0.872711 11.5871 1.11514L11.2477 4.50908C10.5689 4.70301 9.93858 4.99392 9.30828 5.33332L6.69009 3.1515C6.49615 3.00604 6.20524 3.00604 6.05979 3.19998L2.95676 6.30301C2.76282 6.49695 2.76282 6.73938 2.90827 6.93332L5.09009 9.5515C4.7507 10.1818 4.45979 10.8121 4.26585 11.4909L0.871911 11.8303C0.629486 11.8303 0.435547 12.0727 0.435547 12.3151V16.6788C0.435547 16.9212 0.629486 17.1636 0.871911 17.1636L4.26585 17.503C4.45979 18.1818 4.7507 18.8121 5.04161 19.3939L2.85979 22.0121C2.71433 22.206 2.71433 22.497 2.90827 22.6424L6.0113 25.7454C6.20524 25.9394 6.49615 25.9394 6.64161 25.7939L9.25979 23.6121C9.89009 23.9515 10.5204 24.1939 11.1992 24.4363L11.5386 27.8303C11.5386 28.0727 11.781 28.2667 12.0234 28.2667H16.3871C16.6295 28.2667 16.8719 28.0727 16.8719 27.8303L17.2113 24.4363C17.6962 24.2424 18.2295 24 18.7628 23.7091L15.1265 20.1697C11.5871 20.9939 8.48403 17.9394 8.48403 14.497Z"
						fill="#7B68EE"
					/>
				</g>
				<defs>
					<clipPath id="clip0_12387_6614">
						<rect width="32" height="32" fill="white" />
					</clipPath>
				</defs>
			</svg>
		),
	},
	newFeatures: {
		label: __('New Features', 'academy'),
		count: '20+',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
			>
				<path
					d="M17.7889 4.11403C17.0518 2.63993 14.9482 2.63993 14.2111 4.11402L11.3978 9.74077C11.1077 10.3209 10.5543 10.7243 9.91326 10.823L3.86186 11.7547C2.2501 12.0029 1.59686 13.972 2.7407 15.1343L7.09435 19.5583C7.54319 20.0143 7.74669 20.6577 7.64181 21.2889L6.60676 27.5182C6.33664 29.1439 8.03836 30.3804 9.50108 29.6212L15.0786 26.7262C15.6563 26.4263 16.3437 26.4263 16.9214 26.7262L22.499 29.6212C23.9617 30.3804 25.6634 29.144 25.3933 27.5183L24.3582 21.2881C24.2533 20.6568 24.4568 20.0135 24.9057 19.5574L29.259 15.1343C30.4029 13.972 29.7497 12.0029 28.1379 11.7547L22.0867 10.823C21.4457 10.7243 20.8923 10.3209 20.6022 9.74077L17.7889 4.11403ZM16.4767 19.4193C15.6957 20.2003 14.4293 20.2003 13.6483 19.4193L12.5247 18.2957C12.1586 17.9296 12.1586 17.3361 12.5247 16.97C12.8907 16.6039 13.4842 16.6039 13.8503 16.97L14.125 17.2447C14.6428 17.7625 15.4822 17.7625 16 17.2447L18.1497 15.095C18.5157 14.729 19.1093 14.729 19.4753 15.095C19.8414 15.4611 19.8414 16.0546 19.4753 16.4207L16.4767 19.4193Z"
					fill="#7B68EE"
				/>
			</svg>
		),
	},
};

export const currentRelease = [
	{
		free: {
			type: 'Free',
			items: [
				__(
					'Added: Frontend dashboard views — the menu is grouped into Learning, Teaching and Family areas with a "Viewing as" switcher in the account menu. Instructors land on Teaching, guardians on Family, and anyone with a single role never sees the switcher.',
					'academy'
				),
				__(
					'Added: Each area gets its own dashboard landing — teaching stands on its own numbers instead of appending them to the learner\'s, and family counts the children.',
					'academy'
				),
				__(
					'Added: Any dashboard item can now carry a submenu, and name its own index link.',
					'academy'
				),
				__(
					'Added: Quiz question difficulty level, and quiz attempt protection.',
					'academy'
				),
				__(
					'Added: Pro badges and teasers across the admin, so Pro-only features are marked before you click them.',
					'academy'
				),
				__(
					'Added: Extensions & Integrations entries for Easy Content Manager, Board and App Builder; new addon icons.',
					'academy'
				),
				__(
					'Improved: Received Reviews is a real menu item for instructors — it was registered but never shown, so an instructor could not reach their own reviews at all. The learner\'s "Reviews" is now "My Reviews".',
					'academy'
				),
				__(
					'Improved: Dark mode contrast across the dashboard, learn page and settings; refreshed Settings, Webhooks and Discover screens.',
					'academy'
				),
				__(
					'Improved: Updated the licensing SDK.',
					'academy'
				),
				__(
					'Fixed: Autoload failures, PHP notices and menu redirects left over from extracting Digital Campus into its own plugin.',
					'academy'
				),
				__(
					'Fixed: Frontend dashboard — announcement editing, scrollbar, guardian and family routes, notice dismissal, and a stray white section.',
					'academy'
				),
				__(
					'Fixed: Quizzes — save button stuck disabled, permission checks, question images, and question-table bulk actions.',
					'academy'
				),
				__(
					'Fixed: Courses — archive settings not applying, Course Bundle addon and menu visibility, parent category select, and a type-casting error.',
					'academy'
				),
				__(
					'Fixed: Assignment, meeting and booking rendering; Course Active Timer could not be disabled.',
					'academy'
				),
				__(
					'Fixed: Learn page theme toggle, lesson prev/next spacing, and lesson Q&A layout.',
					'academy'
				),
				__(
					'Fixed: Pro gating conditions on certificates, course type and quiz-attempt export; documentation links.',
					'academy'
				),
			],
		},
	},
	{
		pro: {
			type: 'Pro',
			items: [
				__(
					'Added: Campus fees run on StoreEngine — a fee plan becomes a product, monthly plans become subscriptions, and checkout follows whichever e-commerce engine Academy is set to. The Campus invoice ledger is retired.',
					'academy'
				),
				__(
					'Added: Cash taken at the office records a paid order; one-off charges can be collected without a plan; a transport route or hostel room bills its own riders.',
					'academy'
				),
				__(
					'Added: Leave applications — a family applies from their dashboard, the class teacher or the office answers, and approving writes those days into the register as leave rather than absence.',
					'academy'
				),
				__(
					'Added: Teacher tools on the frontend dashboard — my routine, take attendance, enter marks, the class roster with guardians and monthly attendance, behaviour notes, and section notices.',
					'academy'
				),
				__(
					'Added: A student\'s own view of the campus — attendance, routine, exams, fees and the facilities they use.',
					'academy'
				),
				__(
					'Added: Guardian owns parent–teacher messaging. Threads per student and teacher with unread counts and a teacher inbox, plus an on/off switch in Settings → Advanced → Guardian.',
					'academy'
				),
				__(
					'Added: Hostel blocks with occupancy guards, exam invigilators, a per-exam schedule summary, and semester-level analytics.',
					'academy'
				),
				__(
					'Improved: Facilities gain paging, search, per-campus scoping and delete guards; library gains its own category register.',
					'academy'
				),
				__(
					'Improved: Class-level daily attendance, so a school that doesn\'t split classes into sections can still take a register.',
					'academy'
				),
				__(
					'Improved: Exam total and pass marks accept decimals; pro addon menu items declare their dashboard area.',
					'academy'
				),
				__(
					'Fixed: Guardian\'s route flush now only runs from wp-admin — a flush landing on an anonymous front-end request wrote rewrite rules with every instructor-only endpoint missing, and those pages 404\'d until something flushed again from a privileged context.',
					'academy'
				),
				__(
					'Fixed: Dropped the inventory facility; dark mode and colour issues; Digital Campus failing to load.',
					'academy'
				),
			],
		},
	},
];

export const oldReleases = [
	{
		version: '4.0-beta1',
		free: {
			type: 'Free',
			items: [
				__(
					'Added: Full Tailwind CSS admin migration with a new site-wide Light / Dark theme toggle.',
					'academy'
				),
				__(
					'Added: Route-based curriculum editors (course, lesson, quiz, announcement) replacing modals, with a new multi-step course builder.',
					'academy'
				),
				__(
					'Added: Rebuilt student Learn page: drawer-based Notes / Q&A / Announcements / Progress, docked collapsible sidebar, content tabs, unified content card, and mobile UX. React and PHP render paths now match.',
					'academy'
				),
				__(
					'Added: Notes addon (per-lesson learner notes and Q&A).',
					'academy'
				),
				__(
					'Added: Course Active Timer addon with a server-authoritative heartbeat and course locking.',
					'academy'
				),
				__(
					'Added: Guardian / Family feature (opt-in addon) with a My Family dashboard, course assignment, and approvals.',
					'academy'
				),
				__(
					'Added: Quiz Question Bank with a dedicated Questions menu, reusable question library, and inline Reuse Content picker.',
					'academy'
				),
				__(
					'Added: Text-to-Speech read-aloud support for lesson content.',
					'academy'
				),
				__(
					'Added: Dummy Data Seeder addon for dev-only showcase content.',
					'academy'
				),
				__(
					'Added: Webhooks screen (incoming webhooks unified).',
					'academy'
				),
				__(
					'Added: About page (WordPress-style release UI), plus Extensions & Integrations and Discover pages.',
					'academy'
				),
				__(
					'Added: Integrated rich-text mail builder editor.',
					'academy'
				),
				__(
					'Improved: Course & quiz builders: Save / Save & Continue split-buttons with status choice, richer question cards, publish-by-default quizzes, sub-curriculum routing.',
					'academy'
				),
				__(
					'Improved: Replaced react-select with the in-house AcademySelect; more compact, tokenized admin UI.',
					'academy'
				),
				__(
					'Improved: Lesson comments now work under object-cache (High-Performance) mode.',
					'academy'
				),
				__(
					'Improved: SCORM packages now allow .html/.htm files inside uploaded zips.',
					'academy'
				),
				__(
					'Fixed: Course duplication, blank course-builder pages, shortcode/third-party render issues, and Learn Page settings persistence.',
					'academy'
				),
				__(
					'Fixed: Restored quiz question-bank permission checks on read routes.',
					'academy'
				),
				__(
					'Fixed: Removed the in-tree Digital Campus addon (extracted to a standalone plugin).',
					'academy'
				),
			],
		},
	},
	{
		version: '4.0-beta1',
		pro: {
			type: 'Pro',
			items: [
				__(
					'Added: Tailwind CSS admin migration (wave 3) with Light / Dark mode and route-based pro editors (assignment, meeting, booking).',
					'academy'
				),
				__(
					'Added: Tutor Booking auto-creates Zoom / Google Meet meetings on a confirmed booking, with inline paid pricing.',
					'academy'
				),
				__(
					'Added: Google Meet Setup modal with instructions and JSON credential upload.',
					'academy'
				),
				__(
					'Added: Guardian Pro: parent dashboard, messaging, and approvals.',
					'academy'
				),
				__(
					'Added: Course Active Timer with server-authoritative, heartbeat-based billing and course locking.',
					'academy'
				),
				__(
					'Added: Incoming Webhooks with HMAC authentication and CPT-based storage.',
					'academy'
				),
				__(
					'Added: Campus SIS (Pro): multi-head fee plans, exams/attendance/fees/notices/behaviour/facilities, multi-campus, and online fee payment via WooCommerce / StoreEngine.',
					'academy'
				),
				__(
					'Added: Cross-platform release build kit (npm run dist).',
					'academy'
				),
				__(
					'Improved: Tutor booking editor two-column layout, restored archive filters, full-width email mail builder, compact tokenized admin UI.',
					'academy'
				),
				__(
					'Fixed: SCORM LMSInitialize / LMSFinish / LMSCommit now return the required sync string.',
					'academy'
				),
				__(
					'Fixed: Instructor could not see their own course events; product duplication on course duplicate; booking settings migration.',
					'academy'
				),
				__(
					'Fixed: Security: hardened the public apply endpoint and Guardian messaging recipient handling.',
					'academy'
				),
			],
		},
	},
	{
		version: '3.7.4',
		free: {
			type: 'Free',
			items: [
				__(
					'Added: StoreEngine product purchase button click support before force-login restriction',
					'academy'
				),
				__(
					'Fixed: Previewable videos not working on the course learning page.',
					'academy'
				),
				__('Fixed: Translation and localization issues.', 'academy'),
				__('Fixed: Radio button UI/UX inconsistencies.', 'academy'),
				__(
					'Fixed: SCORM file upload logic issues in the course builder.',
					'academy'
				),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Added: Option to extend course enrollment expiration for individual students.',
					'academy'
				),
				__(
					'Fixed: Email addon triggers for lesson comment submissions and replies.',
					'academy'
				),
				__('Fixed: Translation and localization issues.', 'academy'),
			],
		},
	},
	{
		version: '3.7.3',
		pro: {
			type: 'Pro',
			items: [
				__(
					'Added: StoreEngine SDK integration(License Management) added.',
					'academy'
				),
			],
		},
	},
	{
		version: '3.7.2',
		free: {
			type: 'Free',
			items: [
				__(
					'Added: Quiz setting to display skipped questions.',
					'academy'
				),
				__('Fixed: Registration API response issue.', 'academy'),
				__('Fixed: String translation issues.', 'academy'),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Improved: Added link field support in form builder.',
					'academy'
				),
				__('Fixed: String translation issues.', 'academy'),
			],
		},
	},
	{
		version: '3.7.1',
		free: {
			type: 'Free',
			items: [
				__(
					`Added: New quiz setting to control question layout display.`,
					'academy'
				),
				__(
					'Improved: Plugin Activation process for better performance and reliability.',
					'academy'
				),
				__('Fixed: UI/UX design issue.', 'academy'),
				__('Fixed: String translation issues.', 'academy'),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Fixed: Two-step verification message not displaying after registration completion.',
					'academy'
				),
				__('Fixed: Google reCAPTCHA API response issue.', 'academy'),
				__(
					'Fixed: Incorrect hook name in Email Addon before registration.',
					'academy'
				),
			],
		},
	},
	{
		version: '3.7.0',
		free: {
			type: 'Free',
			items: [
				__(
					`Added: New quiz setting to control question layout display.`,
					'academy'
				),
				__(
					'Added: Compatibility with the BerqWP cache plugin.',
					'academy'
				),
				__('Improved: Addons page redesign.', 'academy'),
				__(
					'Improved: Review modal UI/UX on the learn page after completing topics.',
					'academy'
				),
				__(
					'Fixed: Unnecessary data was not fully removed after canceling course enrollment.',
					'academy'
				),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Added: New addon “Multi-media Attachment” to allow multiple sources in a course.',
					'academy'
				),
				__(
					'Fixed: Quiz results were not updating in the grade result table after manually reviewing an attempt.',
					'academy'
				),
				__('Fixed: Lesson duplication issue.', 'academy'),
				__(
					'Fixed: Push notification course completion trigger function argument type error.',
					'academy'
				),
			],
		},
	},
	{
		version: '3.6.0',
		free: {
			type: 'Free',
			items: [
				__('Added: Quizzes question explanation feature.', 'academy'),
				__('Improved: Learn page topics title opacity.', 'academy'),
				__(
					'Fixed: Multiple Administrator role users not getting full access to Academy.',
					'academy'
				),
				__(
					'Fixed: When submitting a question and going back, the previously submitted option was not selected.',
					'academy'
				),
				__(
					'Fixed: User profile and cover photo saving issue.',
					'academy'
				),
				__(
					'Fixed: Lesson SCORM upload time loading props issue (loading props were not included before, now added).',
					'academy'
				),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Fixed: Course enrollment button loading issue after enrollment.',
					'academy'
				),
				__('Fixed: Bundle enrollment count issue.', 'academy'),
				__(
					'Fixed: Course Bundle Enrolled info show before Enrolled issue.',
					'academy'
				),
			],
		},
	},
	{
		version: '3.5.5',
		free: {
			type: 'Free',
			items: [
				__(
					'Improved: ScreenPal video embedded links are now supported in PHP rendering.',
					'academy'
				),
				__(
					'Fixed: WooCommerce suffix content was not displaying in the correct position.',
					'academy'
				),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Fixed: Type declaration error in parameters of Academy SureMembers Addon integration function.',
					'academy'
				),
			],
		},
	},
];

export const newFeature = [
	{
		free: {
			type: 'Free',
			items: [
				__(
					'Full Tailwind CSS admin migration with a new site-wide Light / Dark theme toggle.',
					'academy'
				),
				__(
					'Route-based curriculum editors (course, lesson, quiz, announcement) replacing modals, with a new multi-step course builder.',
					'academy'
				),
				__(
					'Rebuilt student Learn page: drawer-based Notes / Q&A / Announcements / Progress, docked collapsible sidebar, content tabs, unified content card, and mobile UX.',
					'academy'
				),
				__(
					'Notes addon (per-lesson learner notes and Q&A).',
					'academy'
				),
				__(
					'Course Active Timer addon with a server-authoritative heartbeat and course locking.',
					'academy'
				),
				__(
					'Guardian / Family feature (opt-in addon) with a My Family dashboard, course assignment, and approvals.',
					'academy'
				),
				__(
					'Quiz Question Bank with a dedicated Questions menu, reusable question library, and inline Reuse Content picker.',
					'academy'
				),
				__(
					'Text-to-Speech read-aloud support for lesson content.',
					'academy'
				),
				__(
					'Dummy Data Seeder addon for dev-only showcase content.',
					'academy'
				),
				__('Webhooks screen (incoming webhooks unified).', 'academy'),
				__(
					'About page (WordPress-style release UI), plus Extensions & Integrations and Discover pages.',
					'academy'
				),
				__('Integrated rich-text mail builder editor.', 'academy'),
				__(
					`StoreEngine product purchase button click support before force-login restriction`,
					'academy'
				),
				__(
					`New quiz setting to control question layout display.`,
					'academy'
				),
				__('Compatibility with the BerqWP cache plugin.', 'academy'),
				__(
					'Review modal UI/UX on the learn page after completing topics.',
					'academy'
				),
				__(
					'Unnecessary data was not fully removed after canceling course enrollment.',
					'academy'
				),
				__(
					'Users with multiple Administrator roles were not getting full access to Academy.',
					'academy'
				),
				__('Quizzes question explanation feature.', 'academy'),
				__(
					`"Coming Soon" courses now support setting a release date and time when enrollment is enabled.`,
					'academy'
				),
				__(
					'Auto-enroll users into selected courses after registration will based on assigned roles.',
					'academy'
				),
				__('Built-in password reset feature.', 'academy'),
				__(`New "Attendance" addon Compatibility`, 'academy'),
				__('New MemberPress integration Compatibility', 'academy'),
				__(`“Mark as Complete” button in the learn page.`, 'academy'),
				__(
					'Option to regenerate default certificates from the Tools page.',
					'academy'
				),
				__(
					`New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."`,
					'academy'
				),
				__(
					`Academy Player – “Prevent Video Skipping” setting.`,
					'academy'
				),
				__('Learn page topics title opacity.', 'academy'),
				__(
					'Quiz attempt table UI on the Academy quiz learning page.',
					'academy'
				),
			],
		},
		pro: {
			type: 'Pro',
			items: [
				__(
					'Tailwind CSS admin migration (wave 3) with Light / Dark mode and route-based pro editors (assignment, meeting, booking).',
					'academy'
				),
				__(
					'Tutor Booking auto-creates Zoom / Google Meet meetings on a confirmed booking, with inline paid pricing.',
					'academy'
				),
				__(
					'Google Meet Setup modal with instructions and JSON credential upload.',
					'academy'
				),
				__(
					'Guardian Pro: parent dashboard, messaging, and approvals.',
					'academy'
				),
				__(
					'Course Active Timer with server-authoritative, heartbeat-based billing and course locking.',
					'academy'
				),
				__(
					'Incoming Webhooks with HMAC authentication and CPT-based storage.',
					'academy'
				),
				__(
					'Campus SIS (Pro): multi-head fee plans, exams/attendance/fees/notices/behaviour/facilities, multi-campus, and online fee payment via WooCommerce / StoreEngine.',
					'academy'
				),
				__(
					'Cross-platform release build kit (npm run dist).',
					'academy'
				),
				__(
					'New addon “Multi-media Attachment” to allow multiple sources in a course.',
					'academy'
				),
				__(
					'Quiz results were not updating in the grade result table after manually reviewing an attempt.',
					'academy'
				),
				__('Lesson duplication issue.', 'academy'),
				__(`"Attendance" addon.`, 'academy'),
				__('MemberPress integration.', 'academy'),
				__('Free course bundle creation feature.', 'academy'),
				__('Certificate duplication feature.', 'academy'),
				__(
					'Setting to show the course review form only after a minimum completion percentage.',
					'academy'
				),
				__(
					'Booking table now hides private booking information.',
					'academy'
				),
				__(
					`Option to reset course progress data on expire course when it's re-enrollment.`,
					'academy'
				),
				__(
					'Global and individual meeting credentials setup for better flexibility.',
					'academy'
				),
				__('Tutor Booking – Seat limitation feature.', 'academy'),
			],
		},
	},
];
