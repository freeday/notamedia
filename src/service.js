export default {
  getQuestions() {
    return [
      {
        name: "Первая группа вопросов",
        id: 0,
        items: [
          {
            id: 1,
            name: "Вопрос из первой группы 1",
            selected: true,
          },
          {
            id: 2,
            name: "Вопрос из первой группы 2",
            selected: true,
          },
          {
            id: 3,
            name: "Вопрос из первой группы 3",
            selected: true,
          },
        ],
      },
      {
        name: "Вторая группа вопросов",
        id: 4,
        items: [
          {
            id: 5,
            name: "Вопрос из 2-й группы 1",
            selected: true,
          },
          {
            id: 6,
            name: "Вопрос из 2-й группы 2",
            selected: false,
          },
          {
            id: 7,
            name: "Вопрос из 2-й группы 3",
            selected: false,
          },
        ],
      },
      {
        name: "Третья группа вопросов",
        id: 8,
        items: [
          {
            id: 9,
            name: "Вопрос из 3-й группы, записанный в две строки с переносом",
            selected: false,
          },
          {
            id: 10,
            name: "Вопрос из 3-й группы 2",
            selected: false,
          },
          {
            id: 11,
            name: "Вопрос из 3-й группы 3",
            selected: false,
          },
        ],
      },
      {
        id: 12,
        name: "Просто вопрос",
        selected: false,
      },
      {
        id: 13,
        name: "Просто вопрос 2",
        selected: true,
      },
    ];
  },
};
