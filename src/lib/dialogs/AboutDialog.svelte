<script lang="ts">
  import { createDialog, melt } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";
  import CloseIcon from "../icons/CloseIcon.svelte";

  const {
    elements: {
      trigger: trg,
      overlay,
      content,
      title,
      description,
      close,
      portalled,
    },
    states: { open },
  } = createDialog({
    role: "alertdialog",
    forceVisible: true,
  });

  export const trigger = trg;
  export const visible = open;
</script>

<div use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="overlay" />
    <div
      class="content"
      transition:fly={{
        duration: 150,
        y: 8,
      }}
      use:melt={$content}
    >
      <h2 use:melt={$title} class="title">WhirlWind Studio</h2>
      <p use:melt={$description} class="description">
        Version devel<br />
        <small>Git Commit: 00000000</small><br />
        <br />
        (Your marketing headline here)
      </p>

      <div class="actions">
        <button use:melt={$close} class="primary"> OK </button>
      </div>

      <button use:melt={$close} aria-label="Close" class="close">
        <CloseIcon />
      </button>
    </div>
  {/if}
</div>

<style>
  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 90;

    padding: 0.5rem 1rem;

    border-radius: 0.375rem;

    background-color: rgb(var(--bg) / 1);

    font-weight: 500;
    line-height: 1;

    color: rgb(var(--text-second) / 1);

    box-shadow:
      0 10px 15px -3px rgb(0, 0, 0 / 0.1),
      0 4px 6px -4px rgb(0, 0, 0 / 0.1);
  }

  .trigger:hover {
    opacity: 0.75;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;

    background-color: rgb(0 0 0 / 0.5);
  }

  .content {
    position: fixed;
    left: 50%;
    top: 50%;

    z-index: 50;

    max-height: 85vh;
    width: 90vw;
    max-width: 450px;

    transform: translate(-50%, -50%);

    border-radius: 0.375rem;

    background-color: var(--bg);

    padding: 1.5rem;

    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  .title {
    margin: 0;

    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 500;

    color: var(--text-main);
  }

  .description {
    margin-bottom: 1.25rem;
    margin-top: 0.5rem;

    line-height: 1.5;

    color: var(--text-second);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    margin-top: 1.5rem;
  }

  .actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 2rem;

    border-radius: 0.25rem;

    padding: 0 1rem;

    font-weight: 500;
    line-height: 1;

    cursor: pointer;
  }

  .actions button.secondary {
    background-color: rgb(var(--color-zinc-100) / 1);

    color: rgb(var(--color-zinc-600) / 1);
  }

  .actions button.primary {
    background-color: var(--accent);

    color: var(--text-main);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;

    position: absolute;
    right: 10px;
    top: 10px;

    appearance: none;

    height: 1.5rem;
    width: 1.5rem;

    border-radius: 9999px;

    color: var(--text-second);
  }

  .close:hover {
    background-color: var(--interact-border);
  }

  .close:focus {
    box-shadow: 0px 0px 0px 3px var(--interact-border);
  }
</style>
