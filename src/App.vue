<template lang="pug">
#app
  .questions-selected-count Всего:&nbsp;
    b {{count}} вопросов
  .questions
    .questions-header
      i.icon.icon-question
      | Вопросы для  экзамена
    .questions-body
      .questions-body-segment.questions-body-control
        .questions-search
          input.questions-field(type='text' placeholder='Поиск' v-model='valueSearch' @input='handleInputSearch')
          i.icon.icon-search
        .questions-list(v-if='noSelected.length')
          .questions-item(v-for='item in noSelected' :key='item.id')
            .questions-group(v-if='item.items')
              .question-group(@click='handleClickGroupShown(item)')
                .question-group-wrapper
                  i.icon.icon-arrow-sort(:class="item.groupShown ? 'rotate-90' : ''")
                  i.icon.icon-folder
                  .question-group-name(v-text='item.name')
                i.icon.icon-arrow-right(@click='(handleClickGroupToExam(item.id, $event))')
              .question-group-items(v-if='item.groupShown')
                .question-item(v-for='child in item.items' :key='child.id')
                  .question-group-wrapper
                    .question-item-name(v-text='child.name')
                  i.icon.icon-arrow-right(@click='(handleClickItemToExam(child, $event))')
            .question-item(v-else)
              .question-group-wrapper
                .question-item-name(v-text='item.name')
              i.icon.icon-arrow-right(@click='(handleClickItemToExam(item, $event))')
        .questions-list-empty(v-else)
          span(v-if='valueSearch.length && noSelectedCopy.length')
            | Совпадений не найдено
          span(v-else)
            | Закончились возможные вопросы для экзамена
      .questions-separate
      .questions-body-segment
        .questions-list(v-if='selected.length')
          .questions-item(v-for='item in selected' :key='item.id')
            .questions-group(v-if='item.items')
              .question-group.cursor-default
                .question-group-wrapper
                  i.icon.icon-folder
                  .question-group-name.cursor-text(v-text='item.name')
                  .question-group-count.cursor-text(v-text='item.items.length')
                i.icon.icon-times(@click='handleClickItemFromExam(item)')
            .question-item(v-else)
              .question-group-wrapper
                .question-item-name(v-text='item.name')
              i.icon.icon-times(@click='handleClickItemFromExam(item)')
        .questions-list-empty(v-else)
            | Вопросы для экзамена
    .questions-footer
      button.btn.btn-txt(@click='handleClickClear')
        | Очистить
      button.btn.btn-simple.btn-icon
        i.icon.icon-disk
        | Сохранить экзамен
</template>

<script>
import Vue from "vue";
import Service from "@/service.js";
export default {
  name: "App",
  data() {
    return {
      valueSearch: "",
      selected: [],
      noSelected: [],
      noSelectedCopy: [],
      startState: [],
    };
  },
  computed: {
    count() {
      let arr = [];
      for (let i = 0; i < this.selected.length; i++) {
        const el = this.selected[i];
        if (el.items) {
          arr = arr.concat(el.items);
        } else {
          arr.push(el);
        }
      }
      return arr.length;
    },
  },
  created() {
    const list = Service.getQuestions().map((o) => {
      if (o.items && o.items.length) {
        o.items = o.items.map((item) => {
          item.group_id = o.id;
          return item;
        });
      }
      return o;
    });
    this.startState = this.simpleCopy(list);
    this.prepare(list);
  },
  methods: {
    prepare(list) {
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.items) {
          if (
            o.items.every((item) => {
              return item.selected;
            })
          ) {
            this.selected.push(o);
            continue;
          }
          if (
            o.items.every((item) => {
              return !item.selected;
            })
          ) {
            this.noSelected.push(o);
            continue;
          }
          const selected = o.items.filter((item) => {
            return item.selected;
          });
          const noSelected = o.items.filter((item) => {
            return !item.selected;
          });
          if (noSelected.length) {
            this.noSelected.push(Object.assign(o, { items: noSelected }));
          }
          if (selected.length) {
            this.selected = this.selected.concat(selected);
          }
          continue;
        }
        if (o.selected) {
          this.selected.push(o);
          continue;
        } else {
          this.noSelected.push(o);
          continue;
        }
      }
      this.selected = this.setGroupShown(this.selected);
      this.noSelected = this.setGroupShown(this.noSelected);
      this.noSelectedCopy = this.simpleCopy(this.noSelected);
    },
    setGroupShown(list) {
      return list.map((o) => {
        if (o.items && o.items.length) {
          Vue.set(o, "groupShown", false);
        }
        return o;
      });
    },
    handleClickGroupShown(item) {
      const copy_item = this.noSelectedCopy.find((o) => {
        return o.id === item.id;
      });
      copy_item.groupShown = !item.groupShown;
      item.groupShown = !item.groupShown;
    },
    handleClickGroupToExam(id, event) {
      event.stopPropagation();
      const group = this.noSelectedCopy.find((item) => {
        return item.id === id;
      });
      group.groupShown = false;
      group.items = group.items.map((item) => {
        item.selected = true;
        return item;
      });

      this.noSelected = this.noSelectedCopy.filter((item) => {
        return group.id !== item.id;
      });
      const items = this.selected.filter((item) => {
        return item.group_id === group.id;
      });
      if (items.length) {
        group.items = group.items.concat(items);
        group.items = group.items.map((item) => {
          item.selected = true;
          return item;
        });
        this.selected = this.selected.filter((item) => {
          return item.group_id !== group.id;
        });
      }
      this.selected.push(group);
      this.sortSelectedGroups(this.selected);
      this.noSelectedCopy = this.simpleCopy(this.noSelected);
      if (this.valueSearch.length) {
        this.handleInputSearch();
      }
    },
    handleClickItemToExam(item, event) {
      event.stopPropagation();
      item.selected = true;
      const group = this.noSelectedCopy.find((o) => {
        return item.group_id === o.id;
      });
      if (group && group.items.length === 1) {
        this.handleClickGroupToExam(item.group_id, event);
        return;
      }
      this.noSelected = this.noSelectedCopy.filter((o) => {
        if (o.items) {
          o.items = o.items.filter((child) => {
            return item.id !== child.id;
          });
          if (o.items.length) {
            return o;
          } else {
            return false;
          }
        }
        return item.id !== o.id;
      });
      this.selected.push(item);
      this.selected = this.selected.sort(this.simpleSort);
      this.noSelectedCopy = this.simpleCopy(this.noSelected);
      if (this.valueSearch.length) {
        this.handleInputSearch();
      }
    },
    handleClickItemFromExam(item) {
      if (item.items) {
        item.items.map((o) => {
          o.selected = false;
          return o;
        });
      }
      this.noSelected = this.simpleCopy(this.noSelectedCopy);
      const group = this.noSelected.find((o) => {
        return o.id === item.group_id;
      });
      if (group && group.items) {
        group.items.push(item);
      } else {
        this.noSelected.push(item);
      }
      this.selected = this.selected.filter((o) => {
        return o.id !== item.id;
      });
      this.sortSelectedGroups(this.noSelected);
      this.noSelected = this.noSelected.map((o) => {
        if (o.items) {
          o.items = o.items.sort(this.simpleSort);
        }
        return o;
      });
      this.noSelected = this.noSelected.sort(this.simpleSort);
      this.noSelectedCopy = this.simpleCopy(this.noSelected);
      if (this.valueSearch.length) {
        this.handleInputSearch();
      }
    },
    handleInputSearch() {
      this.noSelected = this.simpleCopy(this.noSelectedCopy);
      if (this.valueSearch.trim().length === 0) {
        return;
      }
      const valueSearchLower = this.valueSearch.toLowerCase();
      this.noSelected = this.noSelected.filter((o) => {
        if (o.items) {
          o.items = o.items.filter((item) => {
            return item.name.toLowerCase().indexOf(valueSearchLower) > -1;
          });
          if (o.items.length) {
            o.groupShown = true;
            return true;
          } else {
            return false;
          }
        }
        return o.name.toLowerCase().indexOf(valueSearchLower) > -1;
      });
    },
    handleClickClear() {
      this.noSelected = [];
      this.selected = [];
      this.prepare(this.simpleCopy(this.startState));
    },
    sortSelectedGroups(list) {
      list.sort((a, b) => {
        if (b.items) {
          return a.id - b.id;
        } else {
          return -1;
        }
      });
    },
    simpleSort(a, b) {
      return a.id - b.id;
    },
    simpleCopy(o) {
      let output, v, key;
      output = Array.isArray(o) ? [] : o == null ? null : {};
      for (key in o) {
        v = o[key];
        output[key] = typeof v === "object" ? this.simpleCopy(v) : v;
      }
      return output;
    },
  },
};
</script>

<style lang="scss">
@font-face {
  font-family: "Roboto";
  src: local("Robotobold"), local("Roboto"),
    url("~@/assets/fonts/roboto/Roboto.woff") format("woff"),
    url("~@/assets/fonts/roboto/Roboto.woff2") format("woff2");
  font-weight: 100;
  font-style: normal;
}
@font-face {
  font-family: "Robotobold";
  src: local("Robotobold"), local("Robotobold"),
    url("~@/assets/fonts/roboto/Robotobold.woff") format("woff"),
    url("~@/assets/fonts/roboto/Robotobold.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
}
#app {
  font-family: Roboto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.question {
  &s {
    max-width: 1200px;
    margin: 0 auto;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.14),
      0px 1px 1px rgba(0, 0, 0, 0.02);
    &-header {
      display: flex;
      align-items: center;
      height: 64px;
      padding: 0 18px;
      background-color: #2b57a8;
      font-family: Robotobold;
      font-size: 20px;
      line-height: 64px;
      text-align: left;
      color: #fff;
      .icon-question {
        margin-right: 10px;
      }
    }
    &-body {
      position: relative;
      display: flex;
      &-segment {
        width: 50%;
      }
    }
    &-search {
      position: relative;
      padding: 16px 16px 0;
      .icon-search {
        position: absolute;
        top: 28px;
        right: 28px;
      }
    }
    &-field {
      width: 100%;
      height: 48px;
      padding: 10px 52px 10px 16px;
      box-sizing: border-box;
      border-radius: 0;
      border: 0;
      outline: none;
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.12),
        0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 1px rgba(0, 0, 0, 0.02);
      font-size: 18px;
      line-height: 27px;
    }
    &-separate {
      position: absolute;
      left: 50%;
      width: 1px;
      height: 100%;
      background-color: rgba(3, 7, 13, 0.12);
      transform: translateX(-50%);
    }
    &-group {
      .question-item-name {
        padding-left: 54px;
        color: rgba(3, 7, 13, 0.6);
      }
    }
    &-selected-count {
      max-width: 1200px;
      padding: 13px 0;
      margin: 0 auto;
      text-align: right;
      color: rgba(3, 7, 13, 0.6);
    }
    &-list {
      padding: 22px 34px;
      &-empty {
        padding: 22px 0;
        text-align: center;
      }
    }
    .icon-arrow-right {
      height: 24px;
    }
  }
  &-group {
    display: flex;
    align-items: center;
    min-height: 36px;
    margin-bottom: 12px;
    cursor: pointer;
    &-wrapper {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
    }
    &-name {
      flex: 1 1 auto;
      text-align: left;
      font-family: Robotobold;
      font-size: 16px;
      font-weight: 500;
      color: rgba(3, 7, 13, 0.87);
    }
    .icon-folder {
      margin-right: 8px;
    }
    .icon-arrow-sort {
      margin-right: 17px;
    }
    .icon-times {
      cursor: pointer;
    }
    &-count {
      width: 90px;
      height: 40px;
      box-sizing: border-box;
      padding: 0 16px;
      margin-right: 13px;
      border-bottom: 1px solid rgba(3, 7, 13, 0.28);
      background-color: #f3f5f8;
      color: rgba(0, 0, 0, 0.6);
      font-size: 16px;
      line-height: 40px;
      text-align: left;
    }
  }
  &-item {
    display: flex;
    align-items: center;
    min-height: 36px;
    margin-bottom: 12px;
    &-name {
      flex: 1 1 auto;
      max-width: 270px;
      text-align: left;
      font-size: 16px;
      color: rgba(3, 7, 13, 0.87);
    }
    .icon-arrow-right,
    .icon-times {
      cursor: pointer;
    }
  }
}

.icon {
  background-repeat: no-repeat;
  background-position: center;
  &-arrow {
    &-right {
      width: 16px;
      height: 8px;
      background-image: url("~@/assets/arrow_right.svg");
      background-size: 16px 8px;
    }
    &-sort {
      width: 5px;
      height: 10px;
      background-image: url("~@/assets/arrow_sort.svg");
      background-size: 5px 10px;
    }
  }
  &-folder {
    width: 24px;
    height: 24px;
    background-image: url("~@/assets/folder.svg");
    background-size: 24px 24px;
  }
  &-times {
    width: 14px;
    height: 14px;
    background-image: url("~@/assets/times.svg");
    background-size: 14px 14px;
  }
  &-question {
    width: 20px;
    height: 20px;
    background-image: url("~@/assets/comments.svg");
    background-size: 20px 20px;
  }
  &-search {
    width: 24px;
    height: 24px;
    background-image: url("~@/assets/search.svg");
    background-size: 24px 24px;
  }
  &-disk {
    width: 24px;
    height: 24px;
    background-image: url("~@/assets/disk.svg");
    background-size: 24px 24px;
  }
}
.rotate-90 {
  transform: rotate(90deg);
}
.questions-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(3, 7, 13, 0.12);
  padding: 8px;
  .btn-txt {
    margin-right: 8px;
  }
}
.btn {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border: 0;
  box-sizing: border-box;
  cursor: pointer;
  outline: none;
  font-family: Robotobold;
  font-size: 14px;
  line-height: 16px;
  &-txt {
    background: transparent;
    color: rgba(3, 7, 13, 0.87);
  }
  &-simple {
    background: #2b57a8;
    border-radius: 2px;
    color: #fff;
  }
  &-icon {
    padding-top: 7px;
    padding-bottom: 7px;
    .icon {
      margin-right: 10px;
    }
  }
}
.cursor {
  &-default {
    cursor: default;
  }
  &-text {
    cursor: text;
  }
}
</style>
