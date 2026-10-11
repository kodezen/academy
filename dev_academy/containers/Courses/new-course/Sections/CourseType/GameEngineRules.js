import React, { useEffect, useState } from 'react';
import Select2 from '@Components/AcademySelect';
import Button from '@Components/Button';
import { Switch } from '@Components/ui';
import { __ } from '@wordpress/i18n';
import { makeRequest } from '@Utils/helper';

const EMPTY_RULE = { type: 'points', value: '' };

const RULE_TYPE_OPTIONS = [
	{ value: 'points', label: __('Points', 'academy') },
	{ value: 'achievement', label: __('Achievement', 'academy') },
	{ value: 'level', label: __('Level', 'academy') },
];

/**
 * Repeatable rule-list editor for the "GameEngine Unlock" course type.
 * Persists to `meta.academy_courses_gameengine_rules` (array of
 * { type: 'points'|'achievement'|'level', value: number }) and
 * `meta.academy_courses_gameengine_require_all` (bool), both registered for
 * REST in `academy/includes/database.php::register_academy_courses_meta()`.
 *
 * UI mirrors the saved-item list + collapsible add/edit form pattern used by
 * `PaidProductSelect/storeProduct` (summary row with edit/delete icons, a
 * "+ Add" trigger that reveals the form) — reuses that component's classes
 * (`academy-store-paid-products*`) rather than duplicating the styling,
 * since both render inside the same `backend` bundle/page.
 */
const GameEngineRules = ({ rules, requireAll, onRulesChange, onRequireAllChange }) => {
	const [achievements, setAchievements] = useState([]);
	const [levels, setLevels] = useState([]);
	const [loading, setLoading] = useState(false);

	const safeRules = Array.isArray(rules) ? rules : [];

	// `null` = no row open for editing; a row index = that saved rule is
	// being edited; `isAddingNew` is the separate "appending a new rule"
	// form, on by default when there's nothing saved yet — same as
	// AddProduct's `isShowForm(!priceData?.length)`.
	const [editingIndex, setEditingIndex] = useState(null);
	const [isAddingNew, setIsAddingNew] = useState(safeRules.length === 0);
	const [draft, setDraft] = useState(EMPTY_RULE);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			makeRequest({ action: 'gameengine_academy/get_achievements' }),
			makeRequest({ action: 'gameengine_academy/get_levels' }),
		])
			.then(([achievementsRes, levelsRes]) => {
				setAchievements(achievementsRes?.data?.data || []);
				setLevels(levelsRes?.data?.data || []);
			})
			.finally(() => setLoading(false));
	}, []);

	const typeLabel = (type) =>
		RULE_TYPE_OPTIONS.find((item) => item.value === type)?.label || type;

	const valueLabel = (rule) => {
		if ('achievement' === rule.type) {
			return (
				achievements.find(
					(item) => String(item.value) === String(rule.value)
				)?.label ?? rule.value
			);
		}
		if ('level' === rule.type) {
			return (
				levels.find(
					(item) => String(item.value) === String(rule.value)
				)?.label ?? rule.value
			);
		}
		return rule.value;
	};

	const startAdd = () => {
		setDraft(EMPTY_RULE);
		setEditingIndex(null);
		setIsAddingNew(true);
	};

	const startEdit = (index) => {
		setDraft({ ...safeRules[index] });
		setEditingIndex(index);
		setIsAddingNew(false);
	};

	const cancelForm = () => {
		setEditingIndex(null);
		setIsAddingNew(false);
	};

	const saveDraft = () => {
		if (!draft.value && 0 !== draft.value) {
			return;
		}
		const next =
			null !== editingIndex
				? safeRules.map((rule, i) => (i === editingIndex ? draft : rule))
				: [...safeRules, draft];
		onRulesChange(next);
		setEditingIndex(null);
		setIsAddingNew(false);
	};

	const removeRule = (index) => {
		onRulesChange(safeRules.filter((_, i) => i !== index));
	};

	const isFormOpen = isAddingNew || null !== editingIndex;

	return (
		<div className="meta-field--course-type__gameengine mt-2">
			<div className="academy-store-paid-products-wrapper">
				<ul className="academy-store-paid-products">
					{safeRules.map(
						(rule, index) =>
							index !== editingIndex && (
								<li
									className="academy-store-paid-products__item"
									key={index}
								>
									<span className="academy-store-paid-product__item-title">
										{`${typeLabel(rule.type)} . ${valueLabel(rule)}`}
									</span>
									<div className="academy-store-paid-products__item-actions">
										<Button
											icon={
												<span className="academy-icon academy-icon--edit"></span>
											}
											suffix="rule-edit"
											border="gray"
											preset="white"
											onClick={() => startEdit(index)}
										/>
										<Button
											icon={
												<span className="academy-icon academy-icon--trash"></span>
											}
											suffix="rule-delete"
											border="gray"
											preset="white"
											onClick={() => removeRule(index)}
										/>
									</div>
								</li>
							)
					)}

					{isFormOpen ? (
						<li className="academy-add-gameengine-rule">
							<div className="academy-gameengine-rule-row flex flex-col gap-2">
								<Select2
									className="academy-select academy-select-gameengine-type"
									value={
										RULE_TYPE_OPTIONS.find(
											(item) => item.value === draft.type
										) || RULE_TYPE_OPTIONS[0]
									}
									onChangeHandler={(newType) =>
										setDraft({
											type: newType || 'points',
											value: '',
										})
									}
									options={RULE_TYPE_OPTIONS}
									isSearchable={false}
									isClearable={false}
									isMulti={false}
								/>

								{'points' === draft.type && (
									<input
										type="number"
										min="0"
										className="academy-input"
										placeholder={__('Amount', 'academy')}
										value={draft.value || ''}
										onChange={(e) =>
											setDraft({
												...draft,
												value:
													parseInt(
														e.target.value,
														10
													) || '',
											})
										}
									/>
								)}

								{'achievement' === draft.type && (
									<Select2
										className="academy-select academy-select-gameengine"
										placeholder={__(
											'Select Achievement',
											'academy'
										)}
										value={
											achievements.find(
												(item) =>
													String(item.value) ===
													String(draft.value)
											) || ''
										}
										onChangeHandler={(newValue) =>
											setDraft({
												...draft,
												value: newValue || '',
											})
										}
										options={achievements}
										isSearchable={true}
										isLoading={loading}
										isClearable={true}
										isMulti={false}
									/>
								)}

								{'level' === draft.type && (
									<Select2
										className="academy-select academy-select-gameengine"
										placeholder={__(
											'Select Level',
											'academy'
										)}
										value={
											levels.find(
												(item) =>
													String(item.value) ===
													String(draft.value)
											) || ''
										}
										onChangeHandler={(newValue) =>
											setDraft({
												...draft,
												value: newValue || '',
											})
										}
										options={levels}
										isSearchable={true}
										isLoading={loading}
										isClearable={true}
										isMulti={false}
									/>
								)}
							</div>

							<div className="academy-add-store-product__actions justify-between">
								<Button
									label={
										null !== editingIndex
											? __('Update Rule', 'academy')
											: __('Add Rule', 'academy')
									}
									suffix="product-add"
									size="sm"
									preset="transparent"
									onClick={saveDraft}
								/>

								{safeRules.length > 0 && (
									<Button
										label={__('Cancel', 'academy')}
										size="sm"
										// suffix="cancel"
										preset="white"
										border="gray"
										onClick={cancelForm}
									/>
								)}
							</div>
						</li>
					) : (
						<Button
							icon={
								<span className="academy-icon academy-icon--plus"></span>
							}
							suffix="add"
							preset="transparent"
							onClick={startAdd}
							label={__('Add Rule', 'academy')}
						/>
					)}
				</ul>
			</div>

			<label className="academy-switch-row flex items-center gap-2 mt-2.5">
				<Switch checked={!!requireAll} onChange={onRequireAllChange} />
				{__('Require ALL rules (AND) instead of ANY (OR)', 'academy')}
			</label>
		</div>
	);
};

export default GameEngineRules;
