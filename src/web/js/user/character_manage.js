angular.module('user.character.manage.services', ['ngResource', 'services.redirection', 'services.troupes', 'services.characters']);

var ratings = [1,2,3,4,5];

var possession = ['Remove', 'Acquire'];

function chunk(arr, size) {
	var newArr = [];
	for (var i=0; i<arr.length; i+=size) {
		newArr.push(arr.slice(i, i+size));
	}
	return newArr;
}

function copyTrait(traitToCopy) {
	return {
		"name": traitToCopy.name,
		"id": traitToCopy.id,
		"rating": traitToCopy.rating,
		"displayableDetailLevel": traitToCopy.displayableDetailLevel,
		"specialization": traitToCopy.specialization,
		"displayableTrait": traitToCopy.displayableTrait
	};
}

function displaySkillsInGroups(scope) {
	var numberOfColumns = 3;
	var skillsToDisplay = scope.skills.slice(0);
	while(skillsToDisplay.length % numberOfColumns != 0) {
		skillsToDisplay.push({});
	}
	scope.skillGroups = chunk(skillsToDisplay, skillsToDisplay.length / numberOfColumns);
}

function initializeSkills(scope, skillSource) {
	skillSource.get().then(function(skills) {
		scope.character.skills.forEach(function(characterSkill) {
			for(var i=0;i<skills.length;i++) {
				if(skills[i].id == characterSkill.id) {
					if(characterSkill.specialization) {
						skills.splice(i+1, 0, copyTrait(characterSkill));
					} else {
						skills[i].rating = characterSkill.rating;
					}
					break;
				}
			}
		});
		scope.skills = skills;
		displaySkillsInGroups(scope);
	});
}

function initializeFlaws(scope, flawSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'flaws', 'characterFlaws', flawSource);
}

function initializeMerits(scope, meritSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'merits', 'characterMerits', meritSource);
}

function initializeBackgrounds(scope, backgroundSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'backgrounds', 'characterBackgrounds', backgroundSource);
}

function initializeDisciplines(scope, disciplineSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'disciplines', 'characterDisciplines', disciplineSource);
}

function initializeElderPowers(scope, elderPowerSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'elderPowers', 'characterElderPowers', elderPowerSource);
}

function initializeTechniques(scope, techniqueSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'techniques', 'characterTechniques', techniqueSource);
}

function initializeNecromanticRituals(scope, necromanticRitualSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'necromanticRituals', 'characterNecromanticRituals', necromanticRitualSource);
}

function initializeThaumaturgicalRituals(scope, thaumaturgicalRitualSource) {
	_initializeFetchedCharacterPossessedTraits(scope, 'thaumaturgicalRituals', 'characterThaumaturgicalRituals', thaumaturgicalRitualSource);
}

function _initializeFetchedCharacterPossessedTraits(scope, traitName, ignore, traitSource) {
	traitSource.get().then(function(traits) {
		scope[traitName] = traits;
	});
}

angular.module('user.character.manage.filters', ['filters.vampire', 'filters.attributes.focuses', 'filters.picker']);

angular.module('user.character.manage.controllers', ['user.character.manage.services', 'user.character.manage.filters', 'sources.vampire', 'sources.attributes.focuses']).
controller('manageCharacter', ['$scope', '$rootScope', 'redirect', 'characterRepository', 'clanSource', 'bloodlineSource', 'disciplineSource', 'physicalFocusSource', 'socialFocusSource', 'mentalFocusSource', 'techniqueSource', 'elderPowerSource', 'necromanticRitualSource', 'thaumaturgicalRitualSource', 'physicalFocusSource', 'socialFocusSource', 'mentalFocusSource', 'skillSource', 'backgroundSource', 'meritSource', 'flawSource',  
                       function($scope,   $rootScope,   redirect,   characterRepository,   clanSource,   bloodlineSource,   disciplineSource,   physicalFocusSource,   socialFocusSource,   mentalFocusSource,   techniqueSource,   elderPowerSource,   necromanticRitualSource,   thaumaturgicalRitualSource,   physicalFocusSource,   socialFocusSource,   mentalFocusSource,   skillSource,   backgroundSource,   meritSource,   flawSource) {
	//--------------------------------------------
	// Setup
	//--------------------------------------------
	$scope.ratings = ratings;
	$scope.possession = possession;
	
	$scope.requests = [];
	
	$scope.disciplineOptions = [];
	
	$scope.clans = {
		list: [],
		clan: null
	}
	
	$scope.bloodlines = {
	    list: [],
	    bloodline: null
	}
	
	clanSource.get().then(function(clans) {
		$scope.clans.list = clans;
		if($scope.character.clan) {
			clans.forEach(function(clan) {
				if(clan.id == $scope.character.clan.id) {
					$scope.clans.clan = clan;
					$scope.bloodlines.list = $scope.clans.clan.bloodlines;
				}
			});
		}
		if($scope.clans.clan && $scope.character.bloodline) {
			$scope.clans.clan.bloodlines.forEach(function(bloodline) {
				if(bloodline.id == $scope.character.bloodline.id) {
					$scope.bloodlines.bloodline = bloodline;
					$scope.disciplineOptions = $scope.bloodlines.bloodline.disciplines;
				}
			});
		}
		if($scope.disciplineOptions && $scope.character.inClanDisciplines) {
			$scope.character.inClanDisciplines.forEach(function(inClanDiscipline, index) {
				if($scope.disciplineOptions[index]) {
					$scope.disciplineOptions[index].discipline = null;
					if($scope.disciplineOptions[index].length == 1) {
						$scope.disciplineOptions[index].discipline = $scope.disciplineOptions[index][0];
					} else {
						$scope.disciplineOptions[index].forEach(function(discipline) {
							if(discipline.id == inClanDiscipline.id) {
								$scope.disciplineOptions[index].discipline = discipline;
							}
						});						
					}
				}
			});
		}
	});
	
	var attributePriorities = [{priority: "Primary (7)", value: 7}, 
	                           {priority: "Secondary (5)", value: 5}, 
	                           {priority: "Tertiary (3)", value: 3}];
	
	var attributePriority = [];
	attributePriority[3] = attributePriorities[2];
	attributePriority[5] = attributePriorities[1];
	attributePriority[7] = attributePriorities[0];
	
	$scope.physicalAttributeFocuses = $scope.character.physicalAttributeFocuses;
	$scope.socialAttributeFocuses = $scope.character.socialAttributeFocuses;
	$scope.mentalAttributeFocuses = $scope.character.mentalAttributeFocuses;
	
	$scope.physical_attribute_focus = function(input) {
		console.log('physical_attribute_focus: ' + input);
	}
	$scope.mental_attribute_focus = function(input) {
		console.log('mental_attribute_focus: ' + input);
	}
	$scope.social_attribute_focus = function(input) {
		console.log('social_attribute_focus: ' + input);
	}
	
	$scope.physical = {
		priorities: attributePriorities,
	    value: $scope.character.physicalAttribute,
	    priority: attributePriority[$scope.character.physicalAttribute],
	}
	physicalFocusSource.get().then(function(focuses) {
		$scope.physical.focuses = focuses;
	});
	
	$scope.social = {
		priorities: attributePriorities,
		value: $scope.character.socialAttribute,
		priority: attributePriority[$scope.character.socialAttribute],
	}
	socialFocusSource.get().then(function(focuses) {
		$scope.social.focuses = focuses;
	});
	
	$scope.mental = {
		priorities: attributePriorities,
		value: $scope.character.mentalAttribute,
		priority: attributePriority[$scope.character.mentalAttribute],
	}
	mentalFocusSource.get().then(function(focuses) {
		$scope.mental.focuses = focuses;
	});
	
	initializeSkills($scope, skillSource);
	initializeBackgrounds($scope, backgroundSource);
	initializeDisciplines($scope, disciplineSource);
	initializeTechniques($scope, techniqueSource);
	initializeElderPowers($scope, elderPowerSource);
	initializeNecromanticRituals($scope, necromanticRitualSource);
	initializeThaumaturgicalRituals($scope, thaumaturgicalRitualSource);
	initializeMerits($scope, meritSource);
	initializeFlaws($scope, flawSource);
	
	//----------------------------------------------
	
	$scope.clanChange = function() {
		if($scope.clans.clan) {
			$scope.requests.push({"traitType": 0, "traitChange": 0, "trait": $scope.clans.clan.id});
			$scope.bloodlines.list = $scope.clans.clan.bloodlines;
			$scope.bloodlines.bloodline = null;
			if($scope.bloodlines.list.length == 1) {
				$scope.bloodlines.bloodline = $scope.bloodlines.list[0];
			}
		}
		$scope.bloodlineChange();
	}
	
	$scope.bloodlineChange = function() {
		$scope.disciplineOptions.forEach(function(disciplines, index, array) {
			if(disciplines.discipline) {
				$scope.requests.push({"traitType": 0, "traitChange": 3, "trait": disciplines.discipline.id});
			}
		});
		
		if($scope.bloodlines.bloodline) {
			$scope.requests.push({"traitType": 0, "traitChange": 1, "trait": $scope.bloodlines.bloodline.id});
			$scope.disciplineOptions = $scope.bloodlines.bloodline.disciplines;
			$scope.disciplineOptions.forEach(function(disciplines, index, array) {
				$scope.disciplineOptions[index].discipline = null;
				if(disciplines.length == 1) {
					$scope.disciplineOptions[index].discipline = disciplines[0];
					$scope.inClanDisciplineChange(index);
				}
			});
		} else {
			$scope.disciplineOptions = [];
		}
	}
	$scope.inClanDisciplineChange = function(index, originalDisciplineOrdinal) {
		if(originalDisciplineOrdinal) {
			$scope.requests.push({"traitType": 0, "traitChange": 3, "trait": originalDisciplineOrdinal});
		}
		if($scope.disciplineOptions[index].discipline) {
			$scope.requests.push({"traitType": 0, "traitChange": 2, "trait": $scope.disciplineOptions[index].discipline.id});
		}
	}
	
	$scope.physicalChange = function() {
		if($scope.physical.priority.value) {
			$scope.requests.push({"traitType": 0, "traitChange": 4, "trait": $scope.physical.priority.value});
		}
	}
	
	$scope.socialChange = function() {
		if($scope.social.priority.value) {
			$scope.requests.push({"traitType": 0, "traitChange": 5, "trait": $scope.social.priority.value});
		}
	}
	
	$scope.mentalChange = function() {
		if($scope.mental.priority.value) {
			$scope.requests.push({"traitType": 0, "traitChange": 6, "trait": $scope.mental.priority.value});
		}
	}
	
	$scope.physicalFocusChange = function() {
		if($scope.physicalAttributeFocuses) {
			$scope.physicalAttributeFocuses.forEach(function(focus, index, array) {
				$scope.requests.push({"traitType": 0, "traitChange": 10, "trait": focus});	
			});
			$scope.physicalAttributeFocuses = [];
		}
		if($scope.physical.focus) {
			$scope.requests.push({"traitType": 0, "traitChange": 7, "trait": $scope.physical.focus.id});
		}
	}
	
	$scope.socialFocusChange = function() {
		if($scope.socialAttributeFocuses) {
			$scope.socialAttributeFocuses.forEach(function(focus, index, array) {
				$scope.requests.push({"traitType": 0, "traitChange": 11, "trait": focus});	
			});
			$scope.socialAttributeFocuses = [];
		}
		if($scope.social.focus) {
			$scope.requests.push({"traitType": 0, "traitChange": 8, "trait": $scope.social.focus.id});
		}
	}
	
	$scope.mentalFocusChange = function() {
		if($scope.mentalAttributeFocuses) {
			$scope.mentalAttributeFocuses.forEach(function(focus, index, array) {
				$scope.requests.push({"traitType": 0, "traitChange": 12, "trait": focus});	
			});
			$scope.mentalAttributeFocuses = [];
		}
		if($scope.mental.focus) {
			$scope.requests.push({"traitType": 0, "traitChange": 9, "trait": $scope.mental.focus.id});
		}
	}
	
	$scope.skillChange = function(skill) {
		if(skill.rating) {
			$scope.setSkill(skill);
		} else {
			$scope.removeSkill(skill);
		}
		
		displaySkillsInGroups($scope);
	}
	
	$scope.setSkill = function(skill) {
		console.log(skill);
		$scope.requests.push({"traitType": 14, "traitChange": 13, "trait": skill.id, "rating": skill.rating, "specialization": skill.specialization});
		if(skill.specialization) {
			for(var i=0;i<$scope.skills.length;i++) {
				if($scope.skills[i].ordinal == skill.ordinal && $scope.skills[i].specialization == skill.specialization) {
					$scope.skills.splice(i+1, 0, copyTrait(skill));
					$scope.skills[i+1].rating = null;
					$scope.skills[i+1].specialization = null;
					break;
				}
			}
		}
	}
	
	$scope.removeSkill = function(skill) {
		$scope.requests.push({"traitType": 14, "traitChange": 14, "trait": skill.id, "specialization": skill.specialization});
		if(skill.specialization) {
			for(var i=0;i<$scope.skills.length;i++) {
				if($scope.skills[i].id == skill.id && $scope.skills[i].specialization == skill.specialization) {
					$scope.skills.splice(i, 1);
				}
			}
		}
	}
	
	//--------------------------------------------------------
	$scope.addTrait = function(traitName, traitType, newTraitName) {
		var trait = copyTrait($scope[newTraitName]);
		if(trait.rating && trait.rating != 'Remove') {
			$scope.character[traitName].push(trait);
			$scope.setTrait(traitType, trait);
			$scope[newTraitName] = null;
		}
	}
	
	$scope.traitChange = function(characterTraitsName, traitType, trait) {
		if(trait.rating && trait.rating != 'Remove') {
			$scope.setTrait(traitType, trait);
		} else {
			for(var i=0;i<$scope.character[characterTraitsName].length;i++) {
				if($scope.character[characterTraitsName][i].id == trait.id && $scope.character[characterTraitsName][i].specialization == trait.specialization) {
					$scope.character[characterTraitsName].splice(i, 1);
				}
			}
			$scope.removeTrait(traitType, trait);
		}
	}
	
	$scope.setTrait = function(traitType, trait) {
		$scope.requests.push({"traitType": traitType, "traitChange": 21, "trait": trait.id, "rating": trait.rating, "specialization": trait.specialization});
	}
	
	$scope.removeTrait = function(traitType, trait) {
		$scope.requests.push({"traitType": traitType, "traitChange": 22, "trait": trait.id, "rating": trait.rating, "specialization": trait.specialization});
	}
	//--------------------------------------------------------
	
	$scope.submit = function() {
		characterRepository.addRequestsToCharacter($scope.character.id, $scope.requests).
			success(function(data, status, headers, config) {redirect.toUrl('/user/page/characters')}).
			error(function(data, status, headers, config) {console.log("addRequestsToCharacter failed")});
	};
}]);

angular.module('user.character.manage.directives', ['user.character.manage.services', 'user.character.manage.filters']).
directive('manageCharacter', ['characterRepository', function(characterRepository) {
	return {
		restrict: 'E',
		scope: {
			character: '=',
		},
		templateUrl: '/js/user/character/manage.html'
	};
}]).
directive('selectClan', [function() {
	return {
		restrict: 'E',
		scope: {
			clans: '=',
			change: '&change'
		},
		templateUrl: '/js/user/character/selectClan.html'
	};
}]).
directive('selectBloodline', [function() {
	return {
		restrict: 'E',
		scope: {
			bloodlines: '=',
			change: '&change'
		},
		templateUrl: '/js/user/character/selectBloodline.html'
	};
}]).
directive('selectInClanDiscipline', [function() {
	return {
		restrict: 'E',
		scope: {
			disciplines: '=',
			change: '&change'
		},
		templateUrl: '/js/user/character/inClanDiscipline.html'
	};
}]).
directive('selectAttribute', [function() {
	return {
		restrict: 'E',
		scope: {
			attributes: '=',
			change: '&change'
		},
		templateUrl: '/js/user/character/selectAttributeValue.html'
	};
}]).
directive('selectAttributeFocus', [function() {
	return {
		restrict: 'E',
		scope: {
			attributes: '=',
			change: '&change',
			filter: '@'
		},
		templateUrl: '/js/user/character/selectAttributeFocus.html'
	};
}]).
directive('selectSkill', [function() {
	return {
		restrict: 'E',
		scope: {
			skillgroups: '=',
			ratingsTitle: '@ratingstitle',
			ratings: '=',			
			change: '&change'
		},
		link: function (scope) {
		      scope.ratings = ratings;
	    },
		templateUrl: '/js/user/character/selectSkill.html'
	};
}]).
directive('addTrait', [function() {
	return {
		restrict: 'E',
		scope: {
			traitTitle: '@traittitle',
			traits: '=',
			trait: '=',
			ratingsTitle: '@ratingstitle',
			ratings: '=',
			change: '&change',
			filter: '@'
		},
		link: function (scope, element, attr) {
	    },
		templateUrl: '/js/user/character/addTrait.html'
	};
}]).
directive('selectTrait', [function() {
	return {
		restrict: 'E',
		scope: {
			traitTitle: '@traittitle',
			traits: '=',
			ratingsTitle: '@ratingstitle',
			ratings: '=',
			change: '&change',
			filter: '@'
		},
		link: function (scope, element, attr) {
	    },
		templateUrl: '/js/user/character/selectTrait.html'
	};
}]);

angular.module('user.character.manage', ['user.character.manage.filters', 'user.character.manage.controllers', 'user.character.manage.directives', 'user.character.manage.services']);