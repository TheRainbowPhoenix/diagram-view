<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1em"
  height="1em"
  viewBox="0 0 24 24"
>
  <g
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  >
    <path
      class="main top"
      style="--f: 4px; --t: 42px; --s: 1"
      d="M21 6.5A9 1.5 0 0 1 12 8a9 1.5 0 0 1-9-1.5A9 1.5 0 0 1 12 5a9 1.5 0 0 1 9 1.5Z"
    />

    <path
      class="alternate a1"
      d="M19.5 8.98c1.24.62.13 1.33-2.72 1.72-2.85.4-6.76.4-9.6 0S3.26 9.6 4.52 8.97"
    />

    <path
      class="main mid"
      style="--f: 6px; --t: 23px; --s: .6"
      d="M17.8 12.74c.65.4-.3.84-2.36 1.08-2.06.24-4.82.24-6.88 0-2.07-.24-3-.67-2.36-1.08"
    />

    <path
      class="alternate a2"
      d="M16.83 15.76c-.59.44-2.57.74-4.83.74-2.26 0-4.24-.3-4.83-.74"
    />

    <path
      class="main bot"
      style="--f: 1px; --t: 15px; --s: .3"
      d="M16.86 18.26c-.46.44-2.05.74-3.86.74s-3.4-.3-3.86-.74"
    />
  </g>
  <path
    fill="currentColor"
    fill-opacity=".1"
    fill-rule="evenodd"
    d="M5.08 7.46c.78 4.72 3.98 5.5 5.77 11.36.63.1 1.34.18 2.15.18l.2-.01c-.14-4.42-2.02-9.61-2.14-11a35.68 35.68 0 0 1-5.98-.53Z"
  />

  <!--
<ellipse
    cx="52"
    cy="6.5"
    fill="#690"
    fill-opacity=".48"
    color="#000"
    overflow="visible"
    rx="9"
    ry="1.5"
    style="isolation:auto;mix-blend-mode:normal;solid-color:#000;solid-opacity:1"
  />
  <ellipse
    cx="52"
    cy="9.5"
    fill="#690"
    fill-opacity=".48"
    color="#000"
    overflow="visible"
    rx="8"
    ry="1.5"
    style="isolation:auto;mix-blend-mode:normal;solid-color:#000;solid-opacity:1"
  />
  <ellipse
    cx="52"
    cy="13"
    fill="#690"
    fill-opacity=".48"
    color="#000"
    overflow="visible"
    rx="6"
    ry="1"
    style="isolation:auto;mix-blend-mode:normal;solid-color:#000;solid-opacity:1"
  />
  <ellipse
    cx="52"
    cy="15.5"
    fill="#690"
    fill-opacity=".48"
    color="#000"
    overflow="visible"
    rx="5"
    ry="1"
    style="isolation:auto;mix-blend-mode:normal;solid-color:#000;solid-opacity:1"
  />
  <ellipse
    cx="53"
    cy="18"
    fill="#690"
    fill-opacity=".48"
    color="#000"
    overflow="visible"
    rx="4"
    ry="1"
    style="isolation:auto;mix-blend-mode:normal;solid-color:#000;solid-opacity:1"
  />

  -->
</svg>

<style>
  svg {
    width: 1.5rem;
    height: 1.5rem;

    background: var(--interact);
    border-radius: 0.25rem;
    padding: 0.25rem;
  }

  .top {
    stroke-dasharray: 32px 6px;
    stroke-dashoffset: var(--f);
  }

  .a1 {
    stroke-dasharray: 16px 8px;
    stroke-dashoffset: 23px;
  }

  .mid {
    stroke-dasharray: 13px 4px;
    stroke-dashoffset: 6px;
  }

  .a2 {
    stroke-dasharray: 10px 8px;
    stroke-dashoffset: 1px;
  }

  .bot {
    stroke-dasharray: 8px 6px;
    stroke-dashoffset: 1px;
  }
  .main {
    color: var(--text-main, #fff);
    transition: color 0.2s ease-in-out;
    animation: anim-out calc(var(--s) * 0.9s) forwards;
  }

  .alternate {
    color: var(--text-disabled);
    transition: color 0.2s ease-in-out;
  }

  svg path {
    transition: stroke-dashoffset 0.2s ease-in-out;
    animation-fill-mode: forwards;
  }

  svg:hover .alternate {
    opacity: 1;
    color: var(--accent, #fff);
    transition: color 0.2s ease-in-out;
  }

  svg:hover .main {
    transition: stroke-dashoffset 0.2s ease-in-out;
    animation: anim-in calc(var(--s) * 1.2s) linear 0.2s infinite;
  }

  @keyframes anim-in {
    from {
      stroke-dashoffset: var(--f);
    }
    to {
      stroke-dashoffset: var(--t);
    }
  }

  @keyframes anim-out {
    from {
      stroke-dashoffset: var(--t);
    }
    to {
      stroke-dashoffset: var(--f);
    }
  }
</style>
