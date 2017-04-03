package edu.isi.serverbackend.feature.util;

import edu.isi.serverbackend.feature.DifferentOccupationFeature;
import edu.isi.serverbackend.feature.EitherNotPlaceFeature;
import edu.isi.serverbackend.linkedData.*;

public class Sample {
	protected LinkedDataTriple link;
	protected double rarity;
	protected double extensionImporatance;
	protected float eitherNotPlace;
	protected float differentOccupation;
	protected double smallPlace;
	protected double birthdayCloseness;
	protected float sameBirthPlace;
	protected double objectExtensionRarity;
	protected double subjectExtensionRarity;
	protected double objectRarity;
	protected double subjectRarity;
	double interestingness;
	
	public Sample(LinkedDataTriple link){
		this.link = link;
		this.rarity = 0;
		this.extensionImporatance = 0;
		this.eitherNotPlace = 0;
		this.differentOccupation = 0;
		this.smallPlace = 0;
		this.interestingness = 0;
		this.birthdayCloseness = 0;
		this.sameBirthPlace = 0;
		
	}
	
	public Sample(LinkedDataTriple link, double interestingness){
		this.link = link;
		this.rarity = 0;
		this.eitherNotPlace = 0;
		this.differentOccupation = 0;
		this.smallPlace = 0;
		this.extensionImporatance = 0;
		this.sameBirthPlace = 0;
		this.birthdayCloseness = 0;
		this.interestingness = interestingness;
		
	}
	
	public void evalutateFeature(){
		//rarity = RarityFeature.calculateRarity(link);
		eitherNotPlace = EitherNotPlaceFeature.isEitherNotPlace(link);
		differentOccupation = DifferentOccupationFeature.isDifferentOccupation(link);
		//smallPlace = SmallPlaceFeature.calculateSmallPlace(link);
	}

	public LinkedDataTriple getLink() {
		return link;
	}

	public void setLink(LinkedDataTriple link) {
		this.link = link;
	}

	public double getRarity() {
		return rarity;
	}

	public void setRarity(double rarity) {
		this.rarity = rarity;
	}

	public float getEitherNotPlace() {
		return eitherNotPlace;
	}

	public void setEitherNotPlace(float eitherNotPlace) {
		this.eitherNotPlace = eitherNotPlace;
	}

	public float getDifferentOccupation() {
		return differentOccupation;
	}

	public void setDifferentOccupation(float differentOccupation) {
		this.differentOccupation = differentOccupation;
	}

	public double getSmallPlace() {
		return smallPlace;
	}

	public void setSmallPlace(double smallPlace) {
		this.smallPlace = smallPlace;
	}
	
	public double getExtensionImportance(){
		return this.extensionImporatance;
	}
	
	public void setExtensionImportance(double imp){
		this.extensionImporatance = imp;
	}
	
	public double getInterestingness() {
		return interestingness;
	}

	public float getSameBirthPlace(){
		return this.sameBirthPlace;
	}
	
	public void setSameBirthPlace(float sameBirthPlace){
		this.sameBirthPlace = sameBirthPlace;
	}
	
	public double getBirthdayCloseness(){
		return this.birthdayCloseness;
	}
	
	public void setBirthdayCloseness(double birthdayCloseness){
		this.birthdayCloseness = birthdayCloseness;
	}
	
	public void setInterestingness(double interestingness) {
		this.interestingness = interestingness;
	}

	public double getObjectExtensionRarity() {
		return objectExtensionRarity;
	}

	public void setObjectExtensionRarity(double objectExtensionRarity) {
		this.objectExtensionRarity = objectExtensionRarity;
	}

	public double getSubjectExtensionRarity() {
		return subjectExtensionRarity;
	}

	public void setSubjectExtensionRarity(double subjectExtensionRarity) {
		this.subjectExtensionRarity = subjectExtensionRarity;
	}

	public double getSubjectRarity() {
		return subjectRarity;
	}

	public void setSubjectRarity(double subjectRarity) {
		this.subjectRarity = subjectRarity;
	}

	public double getObjectRarity() {
		return objectRarity;
	}

	public void setObjectRarity(double objectRarity) {
		this.objectRarity = objectRarity;
	}
	
}
