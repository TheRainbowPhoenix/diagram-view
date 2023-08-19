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
  import { onMount } from "svelte";

  /** @type {HTMLCanvasElement} */
  let canvas;
  /** @type {THREE.Scene} */
  let scene;
  /** @type {THREE.WebGLRenderer} */
  let renderer;
  /** @type {THREE.Camera} */
  let camera;
  /** @type {THREE.Mesh} */
  let ico;

  const sizes = {
    width: 800,
    height: 600,
  };

  function doResize(ev) {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    // TODO: update camera and renderer
  }

  onMount(() => {
    console.log("mounted !", canvas);

    const scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

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
    ico.position.set(0, -3, 0);

    // Plane
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 1,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.set(0, -3.5, 0);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const light = new THREE.PointLight(0xff1177, 2, 20, 5);
    scene.add(light);

    // Animate
    const clock = new THREE.Clock();
    let lastElapsedTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime;
      lastElapsedTime = elapsedTime;

      //   light.position.y = ico.position.y;

      //Update controls
      //   controls.update();

      // Rotate the grid
      gridHelper.rotation.x += 0.005;
      gridHelper.rotation.y += 0.005;

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  });
</script>

<svelte:window on:resize={doResize} />

<canvas id="map" bind:this={canvas} />

<style>
  canvas {
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 800px;
    min-height: 600px;
  }
</style>
