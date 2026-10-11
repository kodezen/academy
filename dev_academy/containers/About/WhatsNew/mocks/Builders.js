import React from 'react';
import { __ } from '@wordpress/i18n';
import Icon from '../Icons';

/* ---------- Course Builder: stepper + curriculum + save menu ---------- */
export const MockCourseBuilder = () => (
	<div className="awn-panel-mock">
		<div className="awn-stepper">
			<span className="awn-stepper__step is-done">
				<i>
					<Icon name="check" size={12} strokeWidth={2.4} />
				</i>
				{__('Overview', 'academy')}
			</span>
			<span className="awn-stepper__line is-done" />
			<span className="awn-stepper__step is-active">
				<i>2</i>
				{__('Builder', 'academy')}
			</span>
			<span className="awn-stepper__line" />
			<span className="awn-stepper__step">
				<i>3</i>
				{__('Settings', 'academy')}
			</span>
		</div>

		<div className="awn-curr">
			<div className="awn-curr__topic">
				<span className="awn-curr__grip" />
				<b>{__('Module 1 · Light and exposure', 'academy')}</b>
				<small>{__('4 items', 'academy')}</small>
			</div>
			{[
				{ icon: 'video', t: __('Understanding aperture', 'academy') },
				{ icon: 'note', t: __('Reading the histogram', 'academy') },
				{ icon: 'help', t: __('Exposure check quiz', 'academy') },
			].map((l) => (
				<div className="awn-curr__item" key={l.t}>
					<span className="awn-curr__grip" />
					<Icon name={l.icon} size={14} />
					{l.t}
				</div>
			))}
			<div className="awn-curr__item is-dragging">
				<span className="awn-curr__grip" />
				<Icon name="video" size={14} />
				{__('Shooting in golden hour', 'academy')}
			</div>
		</div>

		<div className="awn-save">
			<span className="awn-save__btn">
				{__('Save & Continue', 'academy')}
				<Icon name="chevronDown" size={14} />
			</span>
			<div className="awn-save__menu">
				<span className="is-on">
					<i className="dot is-green" />
					{__('Publish', 'academy')}
				</span>
				<span>
					<i className="dot is-amber" />
					{__('Pending review', 'academy')}
				</span>
				<span>
					<i className="dot is-slate" />
					{__('Draft', 'academy')}
				</span>
			</div>
		</div>
	</div>
);

/* ---------- Certificate Builder: layers + canvas + merge tags ---------- */
export const MockCertificate = () => (
	<div className="awn-panel-mock awn-cert">
		<div className="awn-cert__tools">
			{['type', 'image', 'qr', 'award'].map((n, i) => (
				<span key={n} className={i === 0 ? 'is-on' : ''}>
					<Icon name={n} size={15} />
				</span>
			))}
		</div>
		<div className="awn-cert__canvas">
			<div className="awn-cert__paper">
				<span className="awn-cert__seal">
					<Icon name="award" size={22} />
				</span>
				<small>{__('Certificate of completion', 'academy')}</small>
				<span className="awn-cert__name is-selected">
					{'{{student_name}}'}
					<i className="h tl" />
					<i className="h tr" />
					<i className="h bl" />
					<i className="h br" />
				</span>
				<em>{__('Photography Foundations', 'academy')}</em>
				<div className="awn-cert__foot">
					<span className="awn-cert__sign">
						<svg viewBox="0 0 80 24" width="64" height="20">
							<path
								d="M2 18c8-14 12-14 12-4s6 8 12-2 8-8 10 0 8 6 14-4 10-4 26 6"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.6"
								strokeLinecap="round"
							/>
						</svg>
						<small>{__('Instructor', 'academy')}</small>
					</span>
					<span className="awn-cert__qr">
						<Icon name="qr" size={26} strokeWidth={1.4} />
					</span>
				</div>
			</div>
		</div>
		<div className="awn-cert__tags">
			<small>{__('Merge tags', 'academy')}</small>
			{['student_name', 'course_title', 'completion_date', 'verification_code'].map(
				(t) => (
					<code key={t} className={t === 'verification_code' ? 'is-new' : ''}>
						{`{{${t}}}`}
					</code>
				)
			)}
		</div>
	</div>
);
