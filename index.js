const input = document.querySelector(".search_input");
const searchList = document.querySelector(".search_list");
const selectedList = document.querySelector(".selected_list");
const spinner = document.querySelector(".spinner");

const URL = "https://api.github.com/search/repositories";
const MAX_SEARCH_DISPLAY = 5;
const MAX_REQUEST_PER_MINUTE = 10;
const REQUEST_DELAY = (60 * 1000) / MAX_REQUEST_PER_MINUTE;

let selectedRepos = [];

const debouncedRequest = debounce(request, REQUEST_DELAY);

selectedList.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn_cls")) return;

  const item = e.target.closest(".selected_item");
  if (!item) return;

  const id = Number(item.dataset.id);
  unselectRepository(id);
});

input.addEventListener("input", (e) => {
  search(e.target.value);
});

function debounce(fn, debounceTime) {
  let prevId;
  return function (...args) {
    clearTimeout(prevId);
    return new Promise((res) => {
      prevId = setTimeout(() => res(fn.call(this, ...args)), debounceTime);
    });
  };
}

async function request(query) {
  if (query.length === 0) {
    return [];
  }

  try {
    const res = await fetch(`${URL}?q=${query}`);
    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const { items } = await res.json();
    return items;
  } catch (err) {
    console.error(err.message);
    return [];
  }
}

async function search(query) {
  clearSearchList();
  spinner.style.display = "block";

  const data = await debouncedRequest(query);

  if (data.length !== 0) {
    data.sort((rep1, rep2) => rep2.stargazers_count - rep1.stargazers_count);

    const filteredData = [];
    for (const repo of data) {
      if (filteredData.length === MAX_SEARCH_DISPLAY) break;

      if (!isSelectedRepository(repo.id)) {
        filteredData.push(repo);
      }
    }

    renderSearchList(filteredData);
  }

  spinner.style.display = "none";
}

function clearSearchList() {
  searchList.innerHTML = "";
}

function clearSelectedList() {
  selectedList.innerHTML = "";
}

function renderSearchList(data) {
  clearSearchList();

  data.forEach((repo) => {
    const item = document.createElement("li");
    const btn = document.createElement("button");

    btn.classList.add("list_item_btn");
    btn.textContent = repo.name;

    btn.addEventListener("click", () => {
      selectRepository(repo);

      clearSearchList();
      input.value = "";
    });

    item.append(btn);

    searchList.append(item);
  });
}

function renderSelectedRepositories() {
  clearSelectedList();

  selectedRepos.forEach((data) => {
    const item = document.createElement("li");
    const wrap = document.createElement("div");
    const btnCls = document.createElement("button");
    const imgBtnCls = document.createElement("img");

    const name = document.createElement("div");
    name.textContent = `Name: ${data.name}`;
    wrap.append(name);

    const owner = document.createElement("div");
    owner.textContent = `Owner: ${data.owner.login}`;
    wrap.append(owner);

    const stars = document.createElement("div");
    stars.textContent = `Stars: ${data.stargazers_count}`;
    wrap.append(stars);

    imgBtnCls.src = "./btn_cls.png";
    imgBtnCls.alt = "Close";

    item.classList.add("selected_item");
    btnCls.classList.add("btn_cls");

    item.append(wrap);
    item.append(btnCls);
    btnCls.append(imgBtnCls);

    item.dataset.id = data.id;

    selectedList.append(item);
  });
}

function selectRepository(data) {
  const { id, name, owner, stargazers_count } = data;
  selectedRepos.push({ id, name, owner, stargazers_count });
  renderSelectedRepositories();
}

function unselectRepository(id) {
  selectedRepos = selectedRepos.filter((repo) => repo.id !== id);
  renderSelectedRepositories();
}

function isSelectedRepository(id) {
  for (const repo of selectedRepos) {
    if (repo.id === id) {
      return true;
    }
  }

  return false;
}
