const accessToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImM4NWU2NWY2YWFhZTAxYTEwNThjNzk3YTg0ODc0M2Q3YTY3YWI3ZWIxMWE0M2ZjNmI2Nzg3NDU1Y2UzN2EyYWEyYjdmZGFlOWM1YmFlZjY3In0.eyJhdWQiOiJiNDU4MzhkNS0xNTY0LTQ0NGQtYjc2Mi0zNzU5NGJhMjMwOWQiLCJqdGkiOiJjODVlNjVmNmFhYWUwMWExMDU4Yzc5N2E4NDg3NDNkN2E2N2FiN2ViMTFhNDNmYzZiNjc4NzQ1NWNlMzdhMmFhMmI3ZmRhZTljNWJhZWY2NyIsImlhdCI6MTc0MjU3NDg2NSwibmJmIjoxNzQyNTc0ODY1LCJleHAiOjE3NDgwNDQ4MDAsInN1YiI6IjEyMjQwNTkwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyMjg4NjY2LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiY2Y0ZDljNjctZWJjOS00YWU0LTkwYzEtMjE4OTkyNjhkNDBiIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.ThybY2__TH1DCzBgLnZtm1znJyLfyIrEBKdYG5M0B0v8tamc1wr34DgmcnLoBwEG6R9WcCx44Zs7A_RdwyFeOVm_CfvPzSO4cThg1vJXzsRIrEhVpGekM7y3Cr26h-kuUPh7ISJw1dG7_xsVUIYLchoexPb34wUyjLgG2vb7QQyTNM2mX2U9wLH76sKZA3Mhh8lY_SSpcs46bIUVh6APALua4t-8H70lynEstdzsBEII5DQ_BI8VEoFZnxaubuH7wl7QuuK8TS_LIfqj4OpMaBgR4HPwustkGKh1eA0dkO5jj-mCAepQUiSrrSsQHRQDeuN_AhxGMTUCmfq8hruM4Q";
const proxyUrl = "http://localhost:8070/";
const Url = "https://arenqochinyan5.amocrm.ru/api/v4/";
let allDeals = [];
let currentPage = 1;
const limit = 3;
let openDealId = null;

async function fetchDeals() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  loadingSpinner.style.display = "block";
  try {
    const response = await fetch(
      `${proxyUrl}${Url}leads?page=${currentPage}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const deals = data._embedded.leads;
      if (deals && deals.length > 0) {
        allDeals = [...allDeals, ...deals];
        loadDealsInTable();
        if (deals.length === limit) {
          currentPage++;
          setTimeout(fetchDeals, 1000);
        }
      }
    } else {
      console.error("Ошибка при получении сделок:", response.status);
    }
  } catch (error) {
    console.error("Ошибка при запросе:", error);
  } finally {
    loadingSpinner.style.display = "none";
  }
}

async function loadDealsInTable() {
  const tableBody = document.querySelector("#dealsTable tbody");
  tableBody.innerHTML = "";
  for (const deal of allDeals) {
    const row = document.createElement("tr");
    row.classList.add("deal-card");
    row.dataset.id = deal.id;

    const price = deal.price ? deal.price : "Не указан";

    row.innerHTML = `
      <td>${deal.id}</td>
      <td>${deal.name}</td>
      <td>${price}</td>
      <td><div class="task-spinner" style="display: none"></div></td>
    `;
    row.onclick = async function (event) {
      event.stopPropagation();
      await loadLeadDetails(deal.id, row);
      openDealId = deal.id;
    };

    tableBody.appendChild(row);
  }
}

async function loadLeadDetails(leadId, row) {
  const lastTD = row.querySelector("td:last-child");
  const Currspinner = lastTD.querySelector(".task-spinner");
  Currspinner.style.display = "block";
  lastTD.style.display = "flex";
  lastTD.style.gap = "20px";
  try {
    const leadResponse = await fetch(proxyUrl + Url + `leads/${leadId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (leadResponse.ok) {
      const leadData = await leadResponse.json();
      const taskPart = await getTaskStatusForLead(leadId);

      row.innerHTML = `
        <td>${leadData.id}</td>
        <td>${leadData.name}</td>
        <td>${leadData.price || "Не указан"}</td>
        <td>${taskPart}</td>
      `;
    } else {
      console.error("Ошибка при запросе данных сделки:", leadResponse.status);
    }
  } catch (error) {
    console.error("Ошибка при запросе данных:", error);
  }
}

async function getTaskStatusForLead(leadId) {
  try {
    const taskResponse = await fetch(proxyUrl + Url + "tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (taskResponse.ok) {
      const taskData = await taskResponse.json();
      const tasksForLead = taskData._embedded
        ? taskData._embedded.tasks.filter((task) => task.entity_id === leadId)
        : [];

      if (tasksForLead.length > 0) {
        const task = tasksForLead[0];
        const taskCreatedAt = new Date(task.created_at * 1000);
        const taskCompleteTill = new Date(task.complete_till * 1000);
        const today = new Date();

        let statusColor = "red";

        if (!task.is_completed) {
          if (taskCompleteTill <= today) {
            statusColor = "red";
          } else if (taskCompleteTill.toDateString() === today.toDateString()) {
            statusColor = "green";
          } else {
            statusColor = "yellow";
          }
        }
        const ddmmyyyy = formatDate(taskCreatedAt);

        return `
          <span>ID: ${task.id}</span>
          <span>Дата: ${ddmmyyyy}</span>
          <svg width="10" height="10">
            <circle cx="5" cy="5" r="5" fill="${statusColor}" />
          </svg>
        `;
      } else {
        return "Задачи нет";
      }
    } else {
      console.error("Ошибка при запросе задач:", taskResponse.status);
      return "Ошибка";
    }
  } catch (error) {
    console.error("Ошибка при запросе задач:", error);
    return "Ошибка";
  }
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

window.onload = function () {
  fetchDeals();
};
