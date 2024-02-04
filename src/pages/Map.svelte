<script>
  import * as THREE from "three";
  import {
    circOut,
    linear,
    sineInOut,
    sineOut,
    quadInOut,
    quadOut,
    quartOut,
    quintOut,
  } from "svelte/easing";
  import { onMount, onDestroy } from "svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;
  /** @type {HTMLDivElement} */
  let wrapper;
  /** @type {THREE.Scene} */
  let scene;
  /** @type {THREE.WebGLRenderer} */
  let renderer;
  /** @type {THREE.Camera} */
  let camera;
  /** @type {THREE.Mesh} */
  let ico;

  // If the animation loop or not
  let loop = true;

  const sizes = {
    width: 800,
    height: 600,
  };

  function doResize(ev) {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    // TODO: update camera and renderer
  }

  onMount(async () => {
    console.log("mounted !", canvas);

    const data_rep = await fetch("/data.json");

    const data = await data_rep.json();

    const settings = data.settings || {};

    console.log(settings);
    // app.userSettings.setAll(settings)

    // THREE DATA

    const scene = new THREE.Scene();

    // WebGPURenderer ??
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    wrapper.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(1, 1, 3);
    scene.add(camera);

    // Create a grid
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Ico
    ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.MeshNormalMaterial({ wireframe: true })
    );
    scene.add(ico);

    ico.scale.set(1.1, 0.9, 1.1);
    ico.position.set(1, 1, 0.05);

    // Plane
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 1,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.set(0, -3.5, 0);
    plane.rotation.x = -Math.PI / 2;
    // scene.add(plane);

    const light = new THREE.PointLight(0xff1177, 2, 20, 5);
    light.position.set(0, 0, 8);
    scene.add(light);

    // Animate
    const clock = new THREE.Clock();
    let lastElapsedTime = 0;

    wrapper.focus();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime;
      lastElapsedTime = elapsedTime;

      //   light.position.y = ico.position.y;
      //   ico.position.y = (ico.position.y + 0.05) % 10;
      ico.rotation.x += 0.005;
      ico.rotation.y += 0.005;

      //Update controls
      //   controls.update();

      // Rotate the grid
      gridHelper.rotation.x += 0.005;
      gridHelper.rotation.y += 0.005;
      // Rotate the plane
      //   plane.rotation.x += 0.005;
      //   plane.rotation.y += 0.005;

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      if (loop) {
        window.requestAnimationFrame(tick);
      }
    };

    tick();
  });

  onDestroy(() => {
    loop = false;
  });
</script>

<svelte:window on:resize={doResize} />

<div id="map" bind:this={wrapper}>
  <canvas bind:this={canvas} />
</div>

<style>
  #map {
    margin-top: 2em;
    border-radius: 22px;
  }

  canvas {
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 800px;
    min-height: 600px;
    mix-blend-mode: color-dodge;
    background: var(--noise);
    background-size: 140px, 100%, cover;
    background-blend-mode: exclusion;
    background-position: 0% 100%;
    background-color: dimgray;

    border-radius: 22px;
    overflow: hidden;
  }
</style>
