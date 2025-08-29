// App state
			let studentsData = {};
			let currentStudentId = null;
			let currentView = 'grid';

			// Data persistence functions
			function saveData() {
				try {
					localStorage.setItem(
						'classroomPetData',
						JSON.stringify({
							studentsData: studentsData,
							currentPetTheme: currentPetTheme,
							lastSaved: Date.now(),
						})
					);
					console.log('Data saved successfully');
				} catch (error) {
					console.error('Failed to save data:', error);
				}
			}

			function loadData() {
				try {
					const savedData = localStorage.getItem('classroomPetData');
					if (savedData) {
						const parsed = JSON.parse(savedData);
						studentsData = parsed.studentsData || {};
						currentPetTheme = parsed.currentPetTheme || 'default';
						console.log('Data loaded successfully');
						return true;
					}
				} catch (error) {
					console.error('Failed to load data:', error);
				}
				return false;
			}

			function exportData() {
				const dataBlob = new Blob(
					[
						JSON.stringify(
							{
								studentsData: studentsData,
								currentPetTheme: currentPetTheme,
								exportDate: new Date().toISOString(),
								version: '1.0',
							},
							null,
							2
						),
					],
					{ type: 'application/json' }
				);

				const url = URL.createObjectURL(dataBlob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `classroom-pet-data-${
					new Date().toISOString().split('T')[0]
				}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}

			function importData(event) {
				const file = event.target.files[0];
				if (!file) return;

				const reader = new FileReader();
				reader.onload = function (e) {
					try {
						const imported = JSON.parse(e.target.result);
						if (imported.studentsData) {
							studentsData = imported.studentsData;
							currentPetTheme = imported.currentPetTheme || 'default';
							updateStudentSelect();
							updateGridView();
							saveData();
							showMessage('Data imported successfully! 📁', 'success');
						}
					} catch (error) {
						showMessage('Invalid file format!', 'warning');
					}
				};
				reader.readAsText(file);
			}

			// Pet stages configuration with image support
			const petStages = [
				{
					emoji: '🥚',
					image: null, // Set to image URL when available
					name: 'Pet Egg',
					stage: 'Egg Stage',
					mood: 'Waiting to hatch...',
					pointsNeeded: 0,
				},
				{
					emoji: '🐣',
					image: null, // You can replace with: 'path/to/baby-pet.png'
					name: 'Baby Pet',
					stage: 'Baby Stage',
					mood: 'Chirping happily!',
					pointsNeeded: 50,
				},
				{
					emoji: '🐶',
					image: null, // You can replace with: 'path/to/young-pet.png'
					name: 'Young Pet',
					stage: 'Child Stage',
					mood: 'Ready to play!',
					pointsNeeded: 150,
				},
				{
					emoji: '🦄',
					image: null, // You can replace with: 'path/to/adult-pet.png'
					name: 'Magical Pet',
					stage: 'Adult Stage',
					mood: 'Majestic and wise!',
					pointsNeeded: 300,
				},
				{
					emoji: '🐉',
					image: null, // You can replace with: 'path/to/elder-pet.png'
					name: 'Dragon Pet',
					stage: 'Elder Stage',
					mood: 'Legendary companion!',
					pointsNeeded: 500,
				},
			];

			// Pet themes for different classes/students
			const petThemes = {
				default: {
					name: 'Classic Pets',
					stages: [
						{ emoji: '🥚', image: null },
						{ emoji: '🐣', image: null },
						{ emoji: '🐶', image: null },
						{ emoji: '🦄', image: null },
						{ emoji: '🐉', image: null },
					],
				},
				dragons: {
					name: 'Dragon Theme',
					stages: [
						{ emoji: '🥚', image: null }, // dragon-egg.png
						{ emoji: '🐲', image: null }, // baby-dragon.png
						{ emoji: '🐉', image: null }, // young-dragon.png
						{ emoji: '🐲', image: null }, // adult-dragon.png
						{ emoji: '🔥', image: null }, // fire-dragon.png
					],
				},
				animals: {
					name: 'Animal Friends',
					stages: [
						{ emoji: '🥚', image: null }, // egg.png
						{ emoji: '🐱', image: null }, // kitten.png
						{ emoji: '🐶', image: null }, // puppy.png
						{ emoji: '🦊', image: null }, // fox.png
						{ emoji: '🦁', image: null }, // lion.png
					],
				},
				fantasy: {
					name: 'Fantasy Creatures',
					stages: [
						{ emoji: '🥚', image: null }, // magic-egg.png
						{ emoji: '🧚', image: null }, // fairy.png
						{ emoji: '🦄', image: null }, // unicorn.png
						{ emoji: '🐲', image: null }, // griffin.png
						{ emoji: '🔮', image: null }, // wizard-pet.png
					],
				},
			};

			function getCurrentPetStage(stageIndex) {
				const baseStage = petStages[stageIndex];
				const themeStage = petThemes[currentPetTheme].stages[stageIndex];

				return {
					...baseStage,
					emoji: themeStage.emoji,
					image: themeStage.image,
				};
			}

			function getPetDisplayElement(stageIndex) {
				const currentStage = getCurrentPetStage(stageIndex);

				if (currentStage.image) {
					return `<img src="${currentStage.image}" alt="${currentStage.name}" class="pet-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                       <div class="pet-emoji" style="display: none;">${currentStage.emoji}</div>`;
				} else {
					return `<div class="pet-emoji">${currentStage.emoji}</div>`;
				}
			}

			function switchPetTheme(themeName) {
				currentPetTheme = themeName;

				// Update button states
				document.querySelectorAll('.theme-btn').forEach((btn) => {
					btn.classList.remove('active');
				});
				event.target.classList.add('active');

				saveData();
				updateGridView();
				updateIndividualView();
				showMessage(`Switched to ${petThemes[themeName].name}! 🎨`, 'success');
			}

			// Happiness emotions
			const happinessEmojis = {
				100: '😍',
				80: '😊',
				60: '😐',
				40: '😕',
				20: '😢',
				0: '😭',
			};

			function switchView(view) {
				currentView = view;

				// Hide all sections first
				document.getElementById('gridView').classList.add('hidden');
				document.getElementById('individualView').classList.add('hidden');
				document.getElementById('studentManagement').classList.add('hidden');
				document.getElementById('individualControls').classList.add('hidden');
				document.getElementById('dataManagement').style.display = 'none';

				// Remove active class from all buttons
				document
					.querySelectorAll('.view-btn')
					.forEach((btn) => btn.classList.remove('active'));

				if (view === 'grid') {
					document.getElementById('gridViewBtn').classList.add('active');
					document.getElementById('gridView').classList.remove('hidden');
					document
						.getElementById('studentManagement')
						.classList.remove('hidden');
					updateGridView();
				} else if (view === 'individual') {
					document.getElementById('individualViewBtn').classList.add('active');
					document.getElementById('individualView').classList.remove('hidden');
					document
						.getElementById('individualControls')
						.classList.remove('hidden');
					updateIndividualView();
				}
			}

			function showDataManagement() {
				// Hide all sections
				document.getElementById('gridView').classList.add('hidden');
				document.getElementById('individualView').classList.add('hidden');
				document.getElementById('studentManagement').classList.add('hidden');
				document.getElementById('individualControls').classList.add('hidden');

				// Show data management
				document.getElementById('dataManagement').style.display = 'block';

				// Update button states
				document
					.querySelectorAll('.view-btn')
					.forEach((btn) => btn.classList.remove('active'));
			}

			function clearAllData() {
				if (
					confirm(
						'⚠️ Are you sure you want to delete ALL student data? This cannot be undone!'
					)
				) {
					studentsData = {};
					currentStudentId = null;
					currentPetTheme = 'default';
					localStorage.removeItem('classroomPetData');
					updateStudentSelect();
					updateGridView();
					showMessage('All data cleared! 🗑️', 'warning');
					switchView('grid');
				}
			}

			function updateGridView() {
				const grid = document.getElementById('studentsGrid');
				const studentNames = Object.keys(studentsData);

				if (studentNames.length === 0) {
					grid.innerHTML = `
                    <div class="no-students">
                        <div class="no-students-icon">🎓</div>
                        <div>No students added yet!</div>
                        <div style="font-size: 0.9em; color: #999; margin-top: 10px;">
                            Add your first student above to get started
                        </div>
                    </div>
                `;
					return;
				}

				grid.innerHTML = studentNames
					.sort()
					.map((studentName) => {
						const student = studentsData[studentName];
						const currentStage = getCurrentPetStage(student.stage);
						const nextStage = petStages[student.stage + 1];

						// Calculate progress
						let progress = 100;
						if (nextStage) {
							const currentPoints =
								student.points - petStages[student.stage].pointsNeeded;
							const pointsNeeded =
								nextStage.pointsNeeded - petStages[student.stage].pointsNeeded;
							progress = Math.min(
								100,
								Math.max(0, (currentPoints / pointsNeeded) * 100)
							);
						}

						// Get happiness emoji
						const happinessLevel = Math.max(
							0,
							Math.min(100, student.happiness)
						);
						const happinessEmoji = Object.entries(happinessEmojis)
							.reverse()
							.find(([threshold]) => happinessLevel >= parseInt(threshold))[1];

						return `
                    <div class="student-card" onclick="switchToIndividual('${studentName}')">
                        <div class="student-card-header">
                            <div class="student-card-name">${studentName}</div>
                            <div class="student-card-stage">${
															currentStage.stage
														}</div>
                        </div>
                        
                        <div class="student-card-pet">${getPetDisplayElement(
													student.stage
												)}</div>
                        
                        <div class="student-card-stats">
                            <div class="student-stat">
                                <div class="student-stat-value">${
																	student.points
																}</div>
                                <div class="student-stat-label">Points</div>
                            </div>
                            <div class="student-stat">
                                <div class="student-stat-value">${
																	student.level
																}</div>
                                <div class="student-stat-label">Level</div>
                            </div>
                            <div class="student-stat">
                                <div class="student-stat-value">${happinessEmoji}</div>
                                <div class="student-stat-label">Mood</div>
                            </div>
                        </div>
                        
                        <div class="student-card-progress">
                            <div class="student-card-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        
                        <div class="student-card-actions" onclick="event.stopPropagation()">
                            <button class="quick-action-btn quick-add" onclick="quickAward('${studentName}', 5)">+5</button>
                            <button class="quick-action-btn quick-add" onclick="quickAward('${studentName}', 10)">+10</button>
                            <button class="quick-action-btn quick-remove" onclick="quickRemove('${studentName}', 5)">-5</button>
                        </div>
                    </div>
                `;
					})
					.join('');
			}

			function switchToIndividual(studentName) {
				currentStudentId = studentName;
				switchView('individual');
				document.getElementById('studentSelect').value = studentName;
				updateIndividualView();
			}

			function quickAward(studentName, points) {
				const student = studentsData[studentName];
				student.points += points;
				student.happiness = Math.min(100, student.happiness + 3);

				checkLevelUp(studentName);
				updateGridView();
				saveData();
				showMessage(`${studentName} earned ${points} points! 🌟`);
			}

			function quickRemove(studentName, points) {
				const student = studentsData[studentName];
				student.points = Math.max(0, student.points - points);
				student.happiness = Math.max(0, student.happiness - 5);

				checkLevelDown(studentName);
				updateGridView();
				saveData();
				showMessage(`${studentName} lost ${points} points.`, 'warning');
			}

			function createStudentData(name) {
				return {
					name: name,
					points: 0,
					level: 1,
					happiness: 100,
					lastFeed: 0,
					lastPlay: 0,
					lastPet: 0,
					stage: 0,
				};
			}

			function addStudent() {
				const nameInput = document.getElementById('studentNameInput');
				const name = nameInput.value.trim();

				if (!name) {
					showMessage('Please enter a student name!', 'warning');
					return;
				}

				if (studentsData[name]) {
					showMessage('Student already exists!', 'warning');
					return;
				}

				studentsData[name] = createStudentData(name);
				updateStudentSelect();
				updateGridView();
				saveData();
				nameInput.value = '';

				showMessage(`${name} has been added! 🎉`, 'success');
			}

			function updateStudentSelect() {
				const select = document.getElementById('studentSelect');
				select.innerHTML = '<option value="">Select a student...</option>';

				Object.keys(studentsData)
					.sort()
					.forEach((studentName) => {
						const option = document.createElement('option');
						option.value = studentName;
						option.textContent = studentName;
						select.appendChild(option);
					});
			}

			function selectStudent() {
				const select = document.getElementById('studentSelect');
				const studentName = select.value;

				if (!studentName) {
					currentStudentId = null;
					showNoStudentDisplay();
					return;
				}

				currentStudentId = studentName;
				updateIndividualView();
				document.getElementById(
					'currentStudent'
				).textContent = `${studentName}'s Pet`;
			}

			function showNoStudentDisplay() {
				document.getElementById('petDisplay').innerHTML = `
                <div class="no-student">
                    👆 Select a student to see their pet!
                </div>
            `;
				document.getElementById('currentStudent').textContent =
					'No student selected';
			}

			function updateIndividualView() {
				if (!currentStudentId) {
					showNoStudentDisplay();
					return;
				}

				const student = studentsData[currentStudentId];
				const currentStage = petStages[student.stage];
				const nextStage = petStages[student.stage + 1];

				document.getElementById('petDisplay').innerHTML = `
                <div class="pet-container">
                    <div class="pet-stage">${currentStage.stage}</div>
                    <div class="pet" id="pet">${currentStage.emoji}</div>
                    <div class="pet-name">${student.name}'s ${currentStage.name}</div>
                    <div class="pet-mood">${currentStage.mood}</div>
                    
                    <div class="progress-container">
                        <div class="progress-label">Growth Progress</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-value" id="pointsValue">${student.points}</div>
                        <div class="stat-label">Good Points</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="levelValue">${student.level}</div>
                        <div class="stat-label">Pet Level</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="happinessValue"></div>
                        <div class="stat-label">Happiness</div>
                    </div>
                </div>
                
                <div class="controls-container">
                    <div class="control-section">
                        <div class="control-title">👩‍🏫 Add Points</div>
                        <button class="button teacher-btn" onclick="awardPoints(5)">Good Behavior +5 🌟</button>
                        <button class="button teacher-btn" onclick="awardPoints(10)">Great Work +10 ⭐</button>
                        <button class="button teacher-btn" onclick="awardPoints(20)">Excellent +20 🏆</button>
                    </div>
                    
                    <div class="control-section">
                        <div class="control-title">⚠️ Remove Points</div>
                        <button class="button remove-btn" onclick="removePoints(3)">Minor Issue -3 😕</button>
                        <button class="button remove-btn" onclick="removePoints(10)">Bad Behavior -10 😠</button>
                        <button class="button remove-btn" onclick="removePoints(20)">Serious Issue -20 😡</button>
                    </div>
                    
                    <div class="control-section">
                        <div class="control-title">🎮 Pet Care</div>
                        <button class="button care-btn" id="feedBtn" onclick="feedPet()">Feed Pet +2 🍎</button>
                        <button class="button care-btn" id="playBtn" onclick="playWithPet()">Play +3 🎾</button>
                        <button class="button care-btn" id="petBtn" onclick="petPet()">Pet +1 🤗</button>
                    </div>
                </div>
            `;

				// Update happiness display
				const happinessLevel = Math.max(0, Math.min(100, student.happiness));
				const happinessEmoji = Object.entries(happinessEmojis)
					.reverse()
					.find(([threshold]) => happinessLevel >= parseInt(threshold))[1];
				document.getElementById('happinessValue').textContent = happinessEmoji;

				// Update progress bar
				if (nextStage) {
					const currentPoints = student.points - currentStage.pointsNeeded;
					const pointsNeeded =
						nextStage.pointsNeeded - currentStage.pointsNeeded;
					const progress = Math.min(
						100,
						Math.max(0, (currentPoints / pointsNeeded) * 100)
					);
					document.getElementById('progressFill').style.width = progress + '%';
				} else {
					document.getElementById('progressFill').style.width = '100%';
				}

				// Update care button availability
				updateCareButtons();
			}

			function updateCareButtons() {
				if (!currentStudentId) return;

				const student = studentsData[currentStudentId];
				const now = Date.now();

				const feedBtn = document.getElementById('feedBtn');
				const playBtn = document.getElementById('playBtn');
				const petBtn = document.getElementById('petBtn');

				if (feedBtn) feedBtn.disabled = now - student.lastFeed < 300000; // 5 minutes
				if (playBtn) playBtn.disabled = now - student.lastPlay < 600000; // 10 minutes
				if (petBtn) petBtn.disabled = now - student.lastPet < 180000; // 3 minutes
			}

			function showMessage(text, type = 'success') {
				const message = document.getElementById('message');
				message.textContent = text;
				message.className = `message ${type}`;
				message.classList.add('show');

				setTimeout(() => {
					message.classList.remove('show');
				}, 3000);
			}

			function createFloatingPoints(points, isPositive = true) {
				const petContainer = document.querySelector('.pet-container');
				if (!petContainer) return;

				const floating = document.createElement('div');
				floating.className = `floating-points ${
					isPositive ? 'positive' : 'negative'
				}`;
				floating.textContent = isPositive
					? `+${points}`
					: `-${Math.abs(points)}`;
				floating.style.left = Math.random() * 200 + 150 + 'px';
				floating.style.top = '50%';

				petContainer.appendChild(floating);

				setTimeout(() => {
					if (petContainer.contains(floating)) {
						petContainer.removeChild(floating);
					}
				}, 2000);
			}

			function awardPoints(points) {
				if (!currentStudentId) {
					showMessage('Please select a student first!', 'warning');
					return;
				}

				const student = studentsData[currentStudentId];
				student.points += points;
				student.happiness = Math.min(100, student.happiness + 5);

				createFloatingPoints(points, true);
				checkLevelUp(currentStudentId);
				updateIndividualView();
				saveData();

				showMessage(`${student.name} earned ${points} points! 🌟`);
			}

			function removePoints(points) {
				if (!currentStudentId) {
					showMessage('Please select a student first!', 'warning');
					return;
				}

				const student = studentsData[currentStudentId];
				student.points = Math.max(0, student.points - points);
				student.happiness = Math.max(0, student.happiness - 10);

				createFloatingPoints(points, false);
				checkLevelDown(currentStudentId);
				updateIndividualView();
				saveData();

				showMessage(
					`${student.name} lost ${points} points for misbehavior.`,
					'warning'
				);
			}

			function checkLevelUp(studentName) {
				const student = studentsData[studentName];

				// Check if pet should evolve
				for (let i = student.stage + 1; i < petStages.length; i++) {
					if (student.points >= petStages[i].pointsNeeded) {
						student.stage = i;
						student.level = i + 1;
						showMessage(
							`🎉 ${student.name}'s pet evolved to ${petStages[i].stage}! 🎉`,
							'info'
						);

						// Add evolution animation if in individual view
						if (currentStudentId === studentName) {
							setTimeout(() => {
								const pet = document.getElementById('pet');
								if (pet) {
									pet.style.transform = 'scale(1.5)';
									pet.style.transition = 'transform 0.5s ease';

									setTimeout(() => {
										pet.style.transform = 'scale(1)';
									}, 500);
								}
							}, 100);
						}

						break;
					}
				}
			}

			function checkLevelDown(studentName) {
				const student = studentsData[studentName];

				// Check if pet should devolve
				for (let i = student.stage - 1; i >= 0; i--) {
					if (student.points < petStages[student.stage].pointsNeeded) {
						student.stage = i;
						student.level = i + 1;
						if (i < petStages.length - 1) {
							showMessage(
								`😔 ${student.name}'s pet went back to ${petStages[i].stage}`,
								'warning'
							);
						}
						break;
					}
				}
			}

			function feedPet() {
				if (!currentStudentId) return;

				const student = studentsData[currentStudentId];
				const now = Date.now();
				if (now - student.lastFeed < 300000) return; // 5 minute cooldown

				student.lastFeed = now;
				student.happiness = Math.min(100, student.happiness + 15);
				student.points += 2;

				updateIndividualView();
				saveData();
				showMessage(`${student.name} fed their pet! +2 points 🍎`);

				createFloatingPoints(2, true);
			}

			function playWithPet() {
				if (!currentStudentId) return;

				const student = studentsData[currentStudentId];
				const now = Date.now();
				if (now - student.lastPlay < 600000) return; // 10 minute cooldown

				student.lastPlay = now;
				student.happiness = Math.min(100, student.happiness + 20);
				student.points += 3;

				updateIndividualView();
				saveData();
				showMessage(`${student.name} played with their pet! +3 points 🎾`);

				createFloatingPoints(3, true);
			}

			function petPet() {
				if (!currentStudentId) return;

				const student = studentsData[currentStudentId];
				const now = Date.now();
				if (now - student.lastPet < 180000) return; // 3 minute cooldown

				student.lastPet = now;
				student.happiness = Math.min(100, student.happiness + 10);
				student.points += 1;

				updateIndividualView();
				saveData();
				showMessage(`${student.name} petted their companion! +1 point 🤗`);

				createFloatingPoints(1, true);
			}

			function handleEnterKey(event) {
				if (event.key === 'Enter') {
					addStudent();
				}
			}

			// Happiness decay for all students
			function updateAllHappiness() {
				let dataChanged = false;
				Object.values(studentsData).forEach((student) => {
					const oldHappiness = student.happiness;
					student.happiness = Math.max(0, student.happiness - 0.1);
					if (oldHappiness !== student.happiness) {
						dataChanged = true;
					}
				});

				if (dataChanged) {
					saveData();
				}

				if (currentView === 'grid') {
					updateGridView();
				} else if (currentStudentId) {
					updateIndividualView();
				}
			}

			// Initialize the app
			if (loadData()) {
				// Data was loaded successfully
				updateStudentSelect();
				showMessage('Welcome back! Your data has been loaded. 📚', 'success');
			}
			switchView('grid');

			// Update happiness every minute
			setInterval(updateAllHappiness, 60000);

			// Update care button states every second
			setInterval(updateCareButtons, 1000);