<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <h1
      class="text-5xl font-bold mb-8 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
    >
      Productive Hub
    </h1>

    <div class="flex flex-wrap gap-4 justify-center">
      <!-- External link button -->
      <a
        href="https://github.com/jesuscnnbs/vuejs-todo-app"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-outline btn-secondary gap-2"
      >
        <span>View on GitHub</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
