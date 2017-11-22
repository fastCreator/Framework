<script>
  export default {
    type: 'basic',
    data () {
      return {
        currentPage: 1,
        currentSize: 10,
        tabIndex: '0',
        radio: null,
        loading: false,
        loadingId: null,
        mostDown: true,
        sort: {},
        selectionState: {},
        selectiAll: false,
        tableShow: true,
        _height: null
      }
    },
    props: {
      filters: {},
      data: {},
      page: {},
      cols: {},
      btns: {},
      tabs: {},
      bind: {},
      height: {},
      most: {},
      hasclear: {
        default: true
      },
      loadingMsg: {
        default: '拼命加载中'
      },
      loadingTimeOut: {
        default: 2000
      },
      rowspan: {
        default () {
          return []
        },
        require: false
      }
    },
    watch: {
      cols: {
        handler () {
          this.$flashTable()
        },
        deep: true
      },
      mostDown: {
        handler (v) {
          let that = this
          if (this.mostDown) {
            this._height = this.height
            that.$flashTable()
          } else {
            this.$nextTick(() => {
              that._height = that.height - that.$el.querySelector('.mostFilter').offsetHeight
              that.$flashTable()
            })
          }
        },
        immediate: true
      }
    },
    computed: {
    },
    methods: {
      $setRadio (value) {
        this.radio = value
      },
      $getRadio () {
        return this.radio
      },
      $startLoading () {
        this.$stopLoading()
        this.loadingId = window.setTimeout(() => {
          this.loading = true
        }, this.loadingTimeOut)
      },
      $stopLoading () {
        this.loading = false
        if (this.loadingId) {
          window.clearTimeout(this.loadingId)
        }
      },
      $flashTable () {
        this.tableShow = false
        this.$nextTick(() => {
          this.tableShow = true
        })
      },
      dealSelect () {
        this.selectiAll = true
        this.data && this.data.forEach((it) => {
          if (!it.$checked) {
            this.selectiAll = false
            return false
          }
        })
      },
      upfilterclear () {
        let filters = [].concat(this.filters, this.most || [])
        for (let i = 0; i < filters.length; i++) {
          let it = filters[i]
          if (it.type === 'text') {
            this.$set(it, 'value', '')
          } else if (it.type === 'el-date-picker') {
            this.$set(it, 'value', [])
          } else if (it.type === 'range') {
            this.$set(it, 'value', [])
          } else {
            this.$set(it, 'value', it.empty || null)
          }
        }
      },
      filterClear () {
        this.selectionState = {}
        this.sort = {}
        this.upfilterclear()
        this.currentPage = 1
        this.currentSize = this.page.setSize || 10
      },
      search () {
        let filters = []
        let that = this
        if (this.filters) {
          filters = filters.concat(this.filters.map(function (item) {
            return {
              key: item.prop,
              value: item.value
            }
          }))
        }
        if (this.most) {
          filters = filters.concat(this.most.map(function (item) {
            return {
              key: item.prop,
              value: item.value
            }
          }))
        }
        this.$emit('search', {
          filters: filters.length ? filters : null,
          page: this.currentPage,
          size: this.currentSize,
          tabIndex: this.tabIndex - 0,
          sort: that.sort
        }, this.selectionState)
      },
      sortUp (props, col) {
        let that = this
        return function () {
          let index = props.$index
          if (index !== 0) {
            col.fuc(that.data[index - 1], that.data[index]).then(function () {
              let arr = that.data[index - 1]
              that.$set(that.data, index - 1, that.data[index])
              that.$set(that.data, index, arr)
            }).catch(function (msg) {
              that.$message({
                message: msg.message,
                type: 'warning'
              })
            })
          }
        }
      },
      sortDown (props, col) {
        let that = this
        return function () {
          let index = props.$index
          if (index !== that.data.length - 1) {
            col.fuc(that.data[index], that.data[index + 1]).then(function () {
              let arr = that.data[index + 1]
              that.$set(that.data, index + 1, that.data[index])
              that.$set(that.data, index, arr)
            }).catch(function (msg) {
              that.$message({
                message: msg.message,
                type: 'warning'
              })
            })
          }
        }
      },
      span (trs, cols, index, start, end) {
        function changeStyle (trs, colIndex, start, end) {
          for (let index = 0; index <= trs.length - 1; index++) {
            let td = trs[index].getElementsByTagName('td')[colIndex]
            if (index === start) {
              td.setAttribute('rowSpan', end - start + 1)
              td.style.display = null
            } else if (index > start && index <= end) {
              td.style.display = 'none'
              td.setAttribute('rowSpan', '0')
            }
          }
        }
        if (start === null || end === null) {
          start = 0
          end = trs.length - 1
        }
        let i = start
        let span = 1
        let content = trs[i].getElementsByTagName('td')[cols[index]].innerHTML
        while (i <= end) {
          let td = trs[i].getElementsByTagName('td')[cols[index]]
          if (content === td.innerHTML) {
            span++
            i++
          } else {
            changeStyle(trs, cols[index], i - span + 1, i - 1)
            if (cols.length > index + 1) {
              this.span(trs, cols, index + 1, i - span + 1, i - 1)
            }
            content = td.innerHTML
            span = 1
          }
        }
        changeStyle(trs, cols[index], i - span + 1, i - 1)
        if (cols.length > index + 1) {
          this.span(trs, cols, index + 1, i - span + 1, i - 1)
        }

          // if (current) {
          //   current.setAttribute('rowSpan', span)
          //   if (cols.length > index + 1) {
          //     this.span(trs, cols, index + 1, currentRowIndex, currentRowIndex + span - 1)
          //   }
          // }
      },
      spanCol (index) {
        if (!this.data || !this.data.length) return false
        this.spanValue = index
        let tableBodies = []
        let cols = (Array.isArray(index) ? index : [index]).sort()
        this.$nextTick(() => {
          this.$refs.table.$children.forEach((row) => {
            if (row.$options._componentTag === 'table-body') {
              tableBodies.push(row)
            }
          })
          tableBodies.forEach((row) => {
            let trs = row.$el.getElementsByTagName('tbody')[0].getElementsByTagName('tr')
            this.span(trs, cols, 0, null, null)
          })
        })
      },
      updateSpan () {
        if (this.rowspan.length) {
          this.$nextTick(() => {
            this.spanCol(this.rowspan)
          })
        }
      },
      selection (v) {
        if (this.isSelect) {
          return false
        } else {
          this.isSelect = true
          this.$nextTick(() => {
            Object.assign(this.selectionState, v)
            this.search()
            this.isSelect = false
          })
        }
      }
    },
    updated () {
      this.updateSpan()
      this.dealSelect()
    },
    render (h) {
      let that = this
      let child = [getTabs(), getFilters(), getMost(), getButton(), getTable(), getPagination()]

      return <div class='bas-table'>{child}</div>
      function getTabs () {
        if (!that.tabs || !that.tabs.length) {
          return ''
        }
        return h('el-tabs', {
          on: {
            'tab-click': function (v) {
              that.tabIndex = v.name
              that.filterClear()
              that.search()
            }
          }
        }, getTab())
      }
      function getTab () {
        let tabs = []
        for (let i = 0; i < that.tabs.length; i++) {
          let tab = that.tabs[i]
          tabs.push(h('el-tab-pane', {
            props: {
              label: tab,
              name: i + ''
            }
          }))
        }
        return tabs
      }
      function getTable () {
        let table = null
        if (that.tableShow) {
          table = h('div', {
            style: {
              height: that._height + 'px'
            }
          }, [
            h('el-table', merge({
              class: 'table',
              props: {
                border: true,
                stripe: true,
                data: that.data,
                maxHeight: that._height
              },
              on: {
                'sort-change' ({column, prop, order}) {
                  that.sort = {}
                  if (prop) {
                    that.sort[prop] = order
                  }

                  that.search()
                },
                'filter-change' (column) {
                  that.selection(column)
                  return true
                }
              },
              attrs: {
                'element-loading-text': that.loadingMsg
              },
              directives: [
                {
                  name: 'loading',
                  value: that.loading
                }
              ],
              ref: 'table'
            }, that.bind), getTableItem(that.cols))
          ])
        }
        return table
      }
      function getTableItem (cols) {
        let column = []
        for (let i = 0; i < cols.length; i++) {
          let col = cols[i]
          let bind = col.bind
          // explain
          if (col.explain) {
            bind = merge(bind, {
              props: {
                renderHeader (h, { column, $index }) {
                  return [h('span', column.label), h('bas-popover', {props: {content: col.explain, placement: 'bottom'}})]
                }
              }
            })
          }
          if (col.child && col.child.length) {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  label: col.label
                }
              }), getTableItem(col.child)))
          } else if (col.type === 'expand') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  type: 'expand'
                },
                scopedSlots: {
                  default: function (props) {
                    return col.render(h, props)
                  }
                }
              })))
          } else if (col.type === 'sort') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  label: col.label,
                  width: 80,
                  sortable: col.sort
                },
                scopedSlots: {
                  default: function (props) {
                    var className = 'sort'
                    if (props.$index === that.data.length - 1) {
                      className += ' sortNo'
                    }
                    return <div class={className}><span class='fa fa-arrow-circle-up sort-up' onClick={that.sortUp(props, col)} title='上移一行' /><span class='fa fa-arrow-circle-down sort-down' onClick={that.sortDown(props, col)}title='下移一行' /></div>
                  }
                }
              })))
          } else if (col.type === 'index') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  label: col.label,
                  width: 80,
                  sortable: col.sort
                },
                scopedSlots: {
                  default: function (props) {
                    return h('span', props.$index + 1 + (that.currentPage - 1) * that.currentSize)
                  }
                }
              })))
          } else if (col.type === 'selection') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  type: 'selection',
                  prop: col.prop || 'checked',
                  width: 46
                }
              })))
          } else if (col.type === 'radio') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  width: 46
                },
                scopedSlots: {
                  default: function (props) {
                    return h('el-radio', {
                      props: {
                        value: that.radio,
                        label: props.$index
                      },
                      class: 'cell-radio',
                      on: {
                        input (value) {
                          that.radio = value
                          that.$emit('radio')
                        }
                      }
                    }, '')
                  }
                }
              })))
          } else if (col.type === 'checkbox') {
            column.push(
              h('el-table-column', merge(bind, {
                props: {
                  width: col.width || 54,
                  renderHeader (h, { column, $index }) {
                    return h('el-checkbox', {
                      class: 'cell-all-checkbox',
                      props: {
                        value: that.selectiAll
                      },
                      attrs: {
                        disabled: col.disabled
                      },
                      on: {
                        input (value) {
                          if (col.input) {
                            col.input(value)
                          }
                          that.data.forEach(function (it) {
                            it.$checked = value
                          })
                          that.selectiAll = value
                        }
                      }
                    }, col.label || '')
                  }
                },
                scopedSlots: {
                  default: function (props) {
                    return h('el-checkbox', {
                      props: {
                        value: that.data[props.$index].$checked,
                        disabled: col.disabled
                      },
                      class: 'cell-checkbox',
                      on: {
                        input (value) {
                          if (col.input) {
                            col.input(value)
                          }
                          that.data[props.$index].$checked = value
                        }
                      }
                    }, '')
                  }
                }
              })))
          } else {
            let obj = {
              label: col.label,
              prop: col.prop,
              width: col.width,
              minWidth: col.minWidth,
              showOverflowTooltip: col.showOverflowTooltip,
              filterPlacement: 'bottom',
              sortable: col.sort
            }
            if (col.filters) {
              obj.filters = col.filters
              obj.filterMultiple = col.filterMultiple
              obj.columnKey = col.prop
            }
            column.push(
              h('el-table-column', merge(bind, {
                props: obj,
                scopedSlots: {
                  default: function (props) {
                    let index = props.$index + 1 + (that.currentPage - 1) * that.currentSize
                    let temp = col.fuc && col.fuc(props.row, h, index, props.$index, props)
                    if (!temp) {
                      temp = {
                        type: 'text',
                        value: props.row[col.prop]
                      }
                    }
                    if (temp.type === 'text') {
                      return h('span', merge(temp.bind, {
                        class: 'nowrap',
                        on: {
                          mouseenter (e) {
                            let cell = e.target.parentNode
                            if (cell.scrollWidth > cell.offsetWidth) {
                              e.target.setAttribute('title', temp.value)
                            }
                          },
                          mouseleave (e) {
                            e.target.setAttribute('title', '')
                          }
                        }}),
                        temp.value)
                    }
                    if (temp.type === 'tag') {
                      return h('el-tag', {props: {type: temp.name}}, temp.value)
                    }
                    if (temp.type === 'tag') {
                      return h('el-tag', {props: {type: temp.name}}, temp.value)
                    }
                    if (temp.type === 'btns') {
                      let btns = temp.btns
                      let arr = []
                      for (let i = 0; i < btns.length; i++) {
                        let btn = btns[i]
                        if (btn.hide) continue

                        arr.push(h('el-button',
                          {
                            class: btn.no ? 'nobtn' : '',
                            props: {
                              type: 'text',
                              disabled: btn.no
                            },
                            on: {
                              click: function () {
                                if (btn.confirm) {
                                  that.$msgbox({
                                    title: '提示',
                                    message: btn.confirm,
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消'
                                  }).then(action => {
                                    btn.click()
                                  })
                                } else {
                                  btn.click()
                                }
                              }
                            },
                            attrs: {
                              title: btn.title
                            }
                          }, btn.label))
                      }
                      // 下拉更多操作
                      let most = temp.most
                      if (most && most.options && most.options.length) {
                        // let dropdownItem = []
                        arr.push(
                          <el-dropdown on-command={most.fuc} trigger='click' className='bas-table'>
                            <span class='el-dropdown-most' title={most.title || '更多操作'}>
                              <i class='el-icon-arrow-down el-icon--right' />
                            </span>
                            <el-dropdown-menu slot='dropdown'>
                              { most.options.map(function (item) {
                                return <el-dropdown-item command={item.label} disabled={item.no}>{item.label}</el-dropdown-item>
                              })}
                            </el-dropdown-menu>
                          </el-dropdown>)
                      }
                      return arr.length ? arr : ''
                    }
                    return temp
                  }
                }
              })))
          }
        }
        return column
      }
      function getPagination () {
        if (!that.page) return null
        that.currentSize = that.page.setSize || that.currentSize
        return h('el-pagination', merge(that.page.bind, {
          props: {
            pageSizes: that.page.pageSizes || [10, 20, 30, 50],
            pageSize: that.page.pageSize || 10,
            currentPage: that.currentPage,
            total: that.page.total,
            layout: that.page.layout || 'total,sizes,prev,pager,next,jumper'
          },
          on: {
            'size-change': function (size) {
              that.currentSize = size
              that.search()
            },
            'current-change': function (page) {
              that.currentPage = page
              that.search()
            }
          }
        }), '')
      }
      function getButton () {
        let btns = []
        if (that.btns) {
          for (let i = 0; i < that.btns.length; i++) {
            let btn = that.btns[i]
            if (btn.option) {
              let item = []
              for (let i = 0; i < btn.option.length; i++) {
                item.push(<el-dropdown-item command={btn.option[i]} >{btn.option[i]}</el-dropdown-item>)
              }
              btns.push(h('el-dropdown', {
                on: {
                  command: btn.command || noon
                },
                props: {
                  trigger: 'click'
                }
              }, [
                (<el-button type='primary'>
                  {btn.label}<i class='el-icon-caret-bottom el-icon--right' />
                </el-button>),
              (<el-dropdown-menu slot='dropdown'>
                {item}
              </el-dropdown-menu>)
              ]))
            } else {
              let bind = merge(btn.bind, {
                props: {
                  type: btn.type || 'primary',
                  icon: btn.icon || ''
                },
                on: {
                  click: btn.click || noon
                }
              })
              btns.push(h('el-button', bind, btn.label || ''))
            }
          }
        }
        if (btns.length) {
          return <div class='btns'>{btns}</div>
        } else {
          return ''
        }
      }
      function getMost () {
        let arr = []
        if (!that.mostDown) {
          that.most.forEach(function (item) {
            arr.push(filterItem(item))
          })
        }
        return h('div', {class: 'most mostFilter'}, arr)
      }
      function getFilters () {
        if (!that.filters) {
          return ''
        }
        let filters = []
        for (let i = 0; i < that.filters.length; i++) {
          filters.push(filterItem(that.filters[i]))
        }
        filters.push(h('el-button', {
          props: {
            type: 'primary'
          },
          on: {
            click: function () {
              that.search()
            }
          }
        }, '查询'))
        if (that.hasclear) {
          filters.push(h('el-button', {
            on: {
              click: function () {
                that.upfilterclear()
                that.search()
              }
            }
          }, '清空'))
        }

        if (that.most && that.most.length) {
          var toggleCaret = function () {
            that.mostDown = !that.mostDown
          }
          if (that.mostDown) {
            filters.push(<span onClick={toggleCaret} class='caret el-icon-caret-bottom'>高级查询</span>)
          } else {
            filters.push(<span onClick={toggleCaret} class='caret el-icon-caret-top'>收起</span>)
          }
        }
        return <div class='filter'>{filters}</div>
      }
      function filterItem (filter) {
        let type = filter.type
        let options = filter.options
        let value = filter.value
        let title = filter.title
        let input = function (v, name) {
          that.$set(filter, 'value', v)
        }
        let inputName = function (name) {
          return function (v) {
            that.$set(filter.value, name, v)
          }
        }
        let model = merge({
          on: {
            input: input
          },
          nativeOn: {
            keyup: function (e) {
              if (e.keyCode === 13) {
                that.search()
              }
            }
          },
          props: {
            value: value
          },
          class: ['filter-item']
        }, filter.bind)
        // if (type === 'title') {
        //   return h('span', merge({
        //     class: ['title']
        //   }, filter.bind), filter.name)
        // } else
        let ret = null
        if (type === 'text') {
          ret = h('el-input', model, '')
        } else if (type === 'select') {
          let opts = []
          for (let i = 0; i < options.length; i++) {
            let it = options[i]
            opts.push(h('el-option', {
              props: {
                label: it.label,
                value: it.value
              }
            }))
          }
          if (filter.remote) {
            model.props.remoteMethod = function (v) {
              if (v.trim()) {
                filter.remoteMethod(v)
              } else {
                filter.options = []
                input('')
              }
            }
            model.props.filterable = true
            model.props.remote = true
          }
          ret = h('el-select', model, opts)
        } else if (type === 'range') {
          ret = h('span', {class: 'range filter-item'},
            [
              <el-input type='number' value={value[0]} on-input={inputName(0)} placeholder={filter.placeholder ? filter.placeholder[0] : ''} />,
              <span>-</span>,
              <el-input type='number' value={value[1]} on-input={inputName(1)} placeholder={filter.placeholder ? filter.placeholder[1] : ''} />
            ])
        } else {
          ret = h(type, model, '')
        }
        if (title) {
          ret = h('span', {class: 'itemSpan'}, [<span class='title'>{title}</span>, ret])
        }
        return ret
      }
    },
    mounted () {
      // this.updateSpan()
    }

  }

function merge () {
    var one = arguments[0]
    for (let i = 1; i < arguments.length; i++) {
      one = mer(one, arguments[i])
    }
    return one
    function mer (obj1, obj2) {
      let obj = Object.assign({}, obj2)
      for (let key in obj1) {
        if (typeof obj[key] === 'object') {
          if (obj[key] instanceof Array) {
            obj[key] = [].concat(obj1[key], obj[key])
          } else {
            obj[key] = Object.assign({}, obj1[key], obj[key])
          }
        }
      }
      return Object.assign({}, obj1, obj)
    }
}
function noon () {}
</script>
<style>
.bas-table .filter-item{
  width:204px;
  display: inline-block;
  margin-bottom:16px;
 }
 .bas-table .filter-item+.filter-item,.bas-table .filter button{
   margin-left:10px;
 }
 .bas-table .btns{
  margin-bottom:16px;
 } 
 .bas-table .el-pagination{
   float: right; 
   margin-top:16px;
 }
 .bas-table .nobtn{
   color:#ccc !important;
   cursor:not-allowed;
 }
 .bas-table .cell>span+.el-button{
   margin-left:10px;
 }
 .bas-table .cell>span+*{
   margin-left:10px;
 }
 .bas-table .cell>*+span{
   margin-left:10px;
 }
 .bas-table *+.el-dropdown{
   margin-left:10px;
 }
 .bas-table .cell .el-dropdown{
   color: #20a0ff;
 }
 .bas-table .nowrap{
   white-space: nowrap
 }
 .bas-table .el-table__body-wrapper tr.el-table__row:nth-of-type(1) .sort-up,.bas-table .el-table__body-wrapper .sortNo .sort-down{
  color:#ccc;
  cursor: not-allowed;
}
.bas-table .sort{
  font-size:18px;
  cursor: pointer;
}
.bas-table .sort .sort-down{
  margin-left:10px;
}
.bas-table .cell-radio{
  margin-left:-4px;
}
.bas-table .el-table__empty-block .el-table__empty-text:before{
  content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMkAAACHCAMAAACLSo0rAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbNQTFRF7vb+2+f/zNz+////6fH/Z26LiZCn9vr/+/3/gIqovsnizNTh8vj+q7LE/v7/7/f++fz//P3/eoCacXeS/f7/4uTpjZKo8Pf+hImh5u732dvi8fj+cHeS1dzo9Pn+7O3w+Pv/7vbh9fb4l5uveH+Z+vz/mqG2kpiv8/n+s7rMoKW3oavFgYehxMzabXWS9fr+3eXw0+Wxf4ehxsjTvMPTqq6+mqXFoqq9s7bFjZe2s7fFrLrahIyoxtX30djp9vb41N/4s8Hhb3aSprPTfYWhdHyZxdDp2eHxz9Lb4+Tpk5u3sLrUqLDFbnaSsLjMzdjxvL/Mh5Cvt8Hbucfoi5Svdn2a0NLbv87wqLLMmJ+3mqO+k569vcDMoKe+d36abnWNqq2+7O3xeoOh4en4iZChoKS3oKzMiI+ouMDUxsnUydDigoyVzNTMwMjbuMeonaqekJevb3eQmqGrdX2QkJuZgIibv8+qq7ij3eXWeH+We4SSlqKcpLGgscCloqqx1d3RkZmms7u7i5GorLLFu8PBxtasy9a/xMzGu7/M5unwp7CwiZOX6fPY5u7c1ue3eYCa////09x2ZAAAAJF0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ADL5YZsAAAqaSURBVHja7J33W+LYGscDekggkAChSRPpKJax17H3cUZHHZ3qFGecnd5n++4tu7ffmz/5JkEgPTkkBNnH7w8+PICQj+d93/M9LSJ0qxVIoQHRUyNUA5+DtBrERyII4hU8FaQi7UUSjEaZnzEGBCH5z6cpKthOJNEQAMAfpBFOfJAIiNKtIPGSZK6BXxsB1GR0hPnrS9okA0boJpJgRXcyIPtKGEHc8F+7CyJpLiNCOUSYJ1EwRjeRxMd+XZiQe4n5mxahv3WjAkLTY6A7gKKYIH3oZpIMIoikwlQhi0Uf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);
  display: block;
  margin-bottom: 6px;
}
.bas-table .el-table__empty-block{
  min-height: 200px;
  width:100% !important;
}
.bas-table .title{
  margin-right: 10px;
  display: inline-block;
  width: 74px;
  text-align: right;
}
.bas-table .caret{
  margin-left: 10px;
  color: #bfcbd9;
  cursor: pointer;
}
.bas-table .caret:hover{
 color: #20a0ff
}
.bas-table .most .range{
  height: 36px;
  display: inline-block;
}
.bas-table .most .range .el-input{
  width:92px;
}
.bas-table .most .range span{
  display: inline-block;
  width: 20px;
  text-align: center;
}
.bas-table .itemSpan{
  display: inline-block;
}
.el-table-filter__list .el-table-filter__list-item:first-child{
  display: none;
}
.bas-table .el-table .cell{
  white-space: nowrap;
}
.bas-table .el-dropdown-most{
  cursor: pointer;
  display: inline-block;
  border: 1px solid #4db3ff;
  border-radius: 6px;
  padding: 4px 3px 2px;
  text-align: center;
  line-height: 1;
  font-size: 12px;
}
.bas-table .el-dropdown-most .el-icon--right{
  margin-left: 0px;
}

.bas-table input[type=number] {  
  -moz-appearance:textfield;  
}  
.bas-table input[type=number]::-webkit-inner-spin-button,  
.bas-table input[type=number]::-webkit-outer-spin-button {  
  -webkit-appearance: none;  
  margin: 0;  
}
</style>