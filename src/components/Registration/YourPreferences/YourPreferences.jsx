import React from 'react';
import './YourPreferences.css';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { SelectButton } from 'primereact/selectbutton';
import { Gender, Interests, SexualInterest } from './constants';
import { Divider } from 'primereact/divider';

const YourPreferences = ({ formData, handleSelectChange, stepperRef }) => {
	return (
		<div className='your-preferences-panel'>
			<h2>Tell us more about you</h2>
			<div className='aligned-div'>
				<span>
					<p>I am a</p>
					<SelectButton value={formData.gender} onChange={(e) => handleSelectChange(e, 'gender')} optionLabel="name" options={Gender} />
				</span>
				<span>
					<p>I am interested in</p>
					<SelectButton value={formData.sexual_interest} onChange={(e) => handleSelectChange(e, 'sexual_interest')} optionLabel="name" options={SexualInterest} />
				</span>
			</div>
			<Divider align="center" />
			<div className='aligned-div'>
				<span className='hobby-selection'>
					<p>My hobbies</p>
					<MultiSelect className='hobby-selection-input' value={formData.interests_tags} options={Interests} onChange={(e) => handleSelectChange(e, 'interests_tags')}
						optionLabel="name" optionValue="value" display="chip" placeholder='Select your interests' showSelectAll={false} filter />
				</span>

			</div>
			<div className='button-div'>
				<Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={() => stepperRef.current.nextCallback()} />
			</div>
		</div>
	);
};

export default YourPreferences;