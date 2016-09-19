			var container, stats;
			var camera, scene, renderer,controls ;
			var group;
			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			var projector;
			var particleMaterial;

			var raycaster;
			var mouse;

			var objects = [];
			var clickedObjects;

			init();
			animate();
			function init() {
				// world
				container = document.getElementById( 'container' );
				camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1100 );
				camera.position.z = -500;
				camera.position.x = -500;
				controls = new THREE.OrbitControls( camera );
				controls.maxDistance = 500;
				controls.minDistance = 0;
				controls.maxPolarAngle = Math.PI/4;
				controls.update();
				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
				scene.fog.color.setHSL( 0.6, 0, 1 );
				group = new THREE.Group();
				scene.add( group );

				// model
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) { };

				THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setPath( 'obj/' );
				mtlLoader.load( 'dollapart1.mtl', function( materials ) {

					materials.preload();

					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials( materials );
					objLoader.setPath( 'obj/' );
					objLoader.load( 'dollapart1.obj', function ( mesh ) {

						mesh.scale.set( 1, 1, 1 );
						mesh.position.set( 0,0,30 );
						mesh.castShadow = true;
						mesh.receiveShadow = true;

						scene.add( mesh );
						group.add( mesh );


					}, onProgress, onError );

				});

				var PI2 = Math.PI * 2;
				particleMaterial = new THREE.SpriteCanvasMaterial( {

					color: 0x000000,
					program: function ( context ) {

						context.beginPath();
						context.arc( 0, 0, 0.5, 0, PI2, true );
						context.fill();

					}

				} );

				var pin = THREE.ImageUtils.loadTexture( 'textures/ballon.png' );

				var marker = new THREE.SpriteMaterial( { map: pin } );
				var sprite = new THREE.Sprite( marker );
				sprite.position.set( 30 , 60 , -10 );
				sprite.scale.set( 20 , 20 , 20 );
				sprite.name = "sprite";
				group.add( sprite );
				scene.add( sprite );
				objects.push( sprite );

				var marker1 = new THREE.SpriteMaterial( { map: pin } );
				var sprite1 = new THREE.Sprite( marker1 );
				sprite1.position.set( -35 , 60 , 30 );
				sprite1.scale.set( 20 , 20 , 20 );
				group.add( sprite1 );
				scene.add( sprite1 );

				var marker2 = new THREE.SpriteMaterial( { map: pin } );
				var sprite2 = new THREE.Sprite( marker2 );
				sprite2.position.set( 0 , 60 , -70 );
				sprite2.scale.set( 20 , 20 , 20 );
				group.add( sprite2 );
				scene.add( sprite2 );

				// ground
				var groundGeo = new THREE.PlaneBufferGeometry( 300, 300 );
				var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
				groundMat.color.setHSL( 0.095, 1, 0.75 );

				var ground = new THREE.Mesh( groundGeo, groundMat );
				ground.rotation.x = -Math.PI/2;
				ground.position.y = -5;
				ground.receiveShadow = true;
				scene.add( ground );
				group.add( ground );


				// light
				var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( 0, 500, 0 );
				scene.add( hemiLight );

				//

				dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				dirLight.position.set( -1, 1.75, 1 );
				dirLight.position.multiplyScalar( 50 );
				scene.add( dirLight );

				dirLight.castShadow = true;

				dirLight.shadow.mapSize.Width = 2048;
				dirLight.shadow.mapSize.Height = 2048;

				dirLight.shadow.camera.left = -5;
				dirLight.shadow.camera.right = 5;
				dirLight.shadow.camera.top = 5;
				dirLight.shadow.camera.bottom = -5;

				dirLight.shadow.camera.far = 3500;
				dirLight.shadow.bias = -0.0001;

				//raycaster

				raycaster = new THREE.Raycaster();
				mouse = new THREE.Vector3();
				projector = new THREE.Projector();

				// render
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( scene.fog.color );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.gammaInput = true;
				renderer.gammaOutput = true;
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.renderReverseSided = false;
				container.appendChild( renderer.domElement );

				//

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );
			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function onDocumentTouchStart( event ) {

				event.preventDefault();

				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
				onDocumentMouseDown( event );

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

				clickable();

			}

			function clickable () {

				raycaster.setFromCamera( mouse, camera );

				var intersects = raycaster.intersectObjects( objects );

				if ( intersects.length > 0 ) {

					selectedObject = intersects[ 0 ].object;

					menu();
					setupTween (camera.position.clone(), new THREE.Vector3 ( 30 , 210 , -10 ), 5000);

				}

			}

			function _(divId) {

				return document.getElementById(divId);

			}

			function hide_button(divId,displayStyle) {
				/*
					displayStyle = block/none
				*/
					_(divId).style.display=displayStyle;

			}

			function setupTween (position, target, duration) {
				TWEEN.removeAll();

					new TWEEN.Tween ( position )
						.to ( target,duration )
						.easing (TWEEN.Easing.Sinusoidal.InOut)
						.onUpdate ( function() {
							camera.lookAt( selectedObject.position );
							camera.position.copy ( position );})
						.onComplete(function () {
							camera.lookAt( selectedObject.position );})
						.start();

			}

			function menu() {

				setupTween (camera.position.clone(), new THREE.Vector3 ( 30 , 210 , -10 ), 5000);

				setTimeout( function(){

						hide_button('back','block'); /*showing button*/
						hide_button('img1','block'); /*showing button*/
						hide_button('panointe','block'); /*showing button*/

				},100);
				//hide_button('back','none'); /*hiding button*/

				var selectedObject = scene.getObjectByName("sprite", true);
					scene.remove(selectedObject);

				var pin = THREE.ImageUtils.loadTexture( 'textures/denah.png' );

				var marker = new THREE.SpriteMaterial( { map: pin } );
				var sprite3 = new THREE.Sprite( marker );
				sprite3.name = "sprite3";
				sprite3.position.set( 30 , 60 , -10 );
				sprite3.scale.set( 70 , 50 , 50 );
				group.add( sprite3 );
				scene.add( sprite3 );

				controls.enabled = false;

			}

			function triggered(elClass) {

				if (elClass == "button") {

					var selectedObject = scene.getObjectByName("sprite3", true);
					scene.remove(selectedObject);

					var pin = THREE.ImageUtils.loadTexture( 'textures/ballon.png' );

					var marker = new THREE.SpriteMaterial( { map: pin } );
					var sprite = new THREE.Sprite( marker );
					sprite.position.set( 30 , 60 , -10 );
					sprite.scale.set( 20 , 20 , 20 );
					sprite.name = "sprite";
					group.add( sprite );
					scene.add( sprite );
					objects.push( sprite );

					controls.enabled = true;

				}

			}

			function backFunction(thisEl) {

				hide_button('img1','none');
				hide_button('back','none');
				hide_button('panointe','none');
				triggered(thisEl.className);
				setupTween (camera.position.clone(), new THREE.Vector3 ( 0 , 500 , 350 ), 5000);
			}

			function animate() {

				requestAnimationFrame( animate );
				render();

			}

			function render() {

				TWEEN.update();

				renderer.render( scene, camera );

			}
