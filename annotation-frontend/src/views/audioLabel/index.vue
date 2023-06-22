<template>
  <div>
    <div class="mixin-components-container">
      <el-card class="box-card" v-if="audioUrl">

        <!-- waveform -->
        <div id="waveform" ref="waveform"></div>
        <!--时间轴 -->
        <div id="wave-timeline" ref="wave-timeline"></div>
        <!-- 控件元素 -->
        <div v-show="wavesurfer !== null && audioUrl !== ''" class="control">
          <!-- 播放按钮 -->
          <div @click="playMusic" class="playBtn">
            <i class="el-icon-video-play" v-if="!playFlag"></i>
            <i class="el-icon-video-pause" v-else></i>
          </div>
          <!-- 纵向缩放 -->
          <div class="zoom">
            <p>振幅缩放</p>
            <input
                data-action="zoom"
                @change="changeBarHeight()"
                v-model="barHeight"
                type="range"
                min="1"
                max="10"
                value="1"
            />
          </div>
          <!-- 水平缩放 -->
          <div class="zoom">
            <p>水平缩放</p>
            <input
                data-action="zoom"
                @change="zoom(zooms)"
                v-model="zooms"
                type="range"
                min="20"
                max="1000"
                value="20"
            />
          </div>
          <!-- 音量 -->
          <div class="grid-content bg-purple-dark" style="margin-left: 40px">
            <el-popover
                placement="top-start"
                trigger="click"
            >
              <div class="block">
                <el-slider
                    v-model="volumeValue"
                    vertical
                    height="100px"
                    width="20px"
                    @change="setVolume(volumeValue)"
                />
              </div>
              <el-button class="normal allbtn primary" slot="reference">
                音量
              </el-button>
            </el-popover>
          </div>
          <!-- 倍速播放 -->
          <div class="grid-content bg-purple-dark">
            <el-tooltip
                class="item"
                effect="dark"
                content="倍速调整"
                placement="bottom"
            >
              <el-popover
                  placement="top"
                  trigger="click"
                  style="width: 180px;margin: 80px"
              >
                <el-input-number
                    v-model="speed"
                    style="width: 180px;align-content: center"
                    :precision="2"
                    :step="0.25"
                    :min="0.5"
                    :max="3"
                    @change="doubleSpeed(speed)"
                />
                <el-button slot="reference" round>
                  {{ speed + " X" }}
                </el-button>
              </el-popover>
            </el-tooltip>
          </div>
        </div>
      </el-card>
      <!-- 空状态 -->
      <el-empty :image-size="200" v-else></el-empty>
    </div>

    <!-- 标注类型 -->
    <div class="primaryType">
      <!--      <p style="font-family: 华文隶书;color:black;size: 30px;align-content: center;border: white">可选标注 → </p>-->
      <!--<el-tag style="color:black;font-size:20px;align-content: center;border: white ;margin-left: 50px">可选标注 →</el-tag>-->
      <el-tag style="margin-left: 50px;margin-right: 30px">可选标注</el-tag>
      <p
          v-for="(tag, index) in fixedType"
          :key="index"
          @click="changeCurType(index)"
          :style='`background: ${curType === index ? "#000" : primaryColor[index].shallow}; color: ${curType === index ? "#FFF" : "#000"}`'
      >{{ tag }}
      </p>
    </div>

    <!-- 标注内容编辑区 -->
    <ul class="labelTextArea" v-if="showList.length > 0">

      <div :style="`border:4px solid ${setColor()};font-size: 25px;width:150px;color:${setColor()};`"
           @click="isChange = !isChange">
        {{ showList[curEditRegionIndex].speaker }}
        <i :class="isChange ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
        <ul v-show="isChange">
          <li
              v-for="(tag, index) in fixedType"
              :key="index"
              @click="editClass(index,$event)"
              :style="`color: ${primaryColor[index].dark};font-size: 20px`"
          >{{ tag }}
          </li>
        </ul>
      </div>
      <div v-show="primaryTypeName.length>0" class="tagArea">
        <p>标注标签：</p>
        <div class="tagList">
          <p
              v-for="(v, k) of primaryTypeName"
              :key="k"
          >
            <input
                type="checkbox"
                v-model="showList[curEditRegionIndex].class"
                :value="v"
            >
            {{ v }}
          </p>
        </div>
      </div>
      <li class="detailInfo">
        <div>
          <el-tag>选择操作</el-tag>
        </div>
        <div>
          <el-button size="small" type="primary" @click.prevent="deleteRegion(showList[curEditRegionIndex].id)">撤销
          </el-button>
        </div>
        <div>
          <el-button size="small" type="primary" @click.prevent="initRegion(showList[curEditRegionIndex].id)">重置
          </el-button>
        </div>
        <div>
          <el-button size="small" type="primary" @click.prevent="submitAnnotation()">提交</el-button>
        </div>
      </li>
    </ul>

    <!--上传文件预览-->


    <!--音频文件上传组件--->
    <div style="margin: 50px;margin-top: 20px">
      <!--      <p style="text-align: right;color: #181818">Audio from <a href="https://librivox.org/">LibriVox</a></p>-->
      <div class="waveform"></div>
      <div class="drop"><p style="color: grey;font-size: 20px">拖拽音频文件到此处</p></div>
      <!--音频文件上传-->
<!--      <el-upload-->
<!--          class="upload-demo"-->
<!--          drag-->
<!--          action="https://jsonplaceholder.typicode.com/posts/"-->
<!--          multiple>-->
<!--        <i class="el-icon-upload"></i>-->
<!--        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>-->
<!--        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
<!--      </el-upload>-->
      <!--选择文件上传组件--->
      <el-upload
          class="upload-demo"
          ref="upload"
          multiple
          action="/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-change="fileLimit"
          :file-list="accessoryList"
          :http-request="submitAccessoryList"
          :on-success="upSuccessAccessory"
          :auto-upload="false"
      >
        <el-button slot="trigger" size="small" type="primary">请选择文件</el-button>
        <el-button
            style="margin-left: 10px"
            size="small"
            type="linear"
            @click="submitUpload"
        >上传
        </el-button
        >
        <el-button
            style="margin-left: 10px"
            size="small"
            type="default"
            @click="(e) => (accessoryList = [])"
        >取消上传
        </el-button
        >
        <span style="color: red">（温馨提示：单个文件不超过100M）</span>
      </el-upload>

    </div>

  </div>


</template>

<script>
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js';
import Timeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js';


export default {
  name: 'AudioLabel',
  props: ['markerImgs', 'pid', {
    //上传附件action的url,如果是自定义调接口上传文件此参数可以不传
    action: {
      type: String,
      default: () => "/",
    },
  }],

  data() {
    return {
      isChange: false,
      zooms: 100, // 缩放
      volumeValue: [1], // 音频音量
      speed: 1.0, // 倍速
      barHeight: 1, // 振幅比例（波线高度）
      fixedType: ['愤怒', '惊恐', '激动', '舒缓', '自然', '不准确', '高压力', '低压力', '高风险', '低风险'], // （固定）
      wavesurfer: null, // 音频波线承载器
      playFlag: false, // 播放按钮切换器
      audioUrl: '', // 音频地址
      initGetData: {}, // 初始化数据留存根
      curType: -1, // 当前标注类型 -1默认 0-9对应primaryTypeName分类下标
      curEditRegionIndex: 0, // 当前可编辑数据下标
      primaryTypeName: [], // 预分类名（最多10个）
      showList: [], // 标注信息列表
      primaryColor: [
        {
          shallow: 'rgba(255, 0, 0, 0.3)',
          dark: 'rgba(255, 0, 0, 1)'
        }, // 第一种
        {
          shallow: 'rgba(0, 0, 255, 0.3)',
          dark: 'rgba(0, 0, 255, 1)'
        }, // 第二种
        {
          shallow: 'rgba(40, 190, 130, 0.3)',
          dark: 'rgba(40, 190, 130, 1)'
        }, // 第三种
        {
          shallow: 'rgba(0, 255, 255, 0.3)',
          dark: 'rgba(0, 255, 255, 1)'
        }, // 第四种
        {
          shallow: 'rgba(255, 0, 255, 0.3)',
          dark: 'rgba(255, 0, 255, 1)'
        }, // 第五种
        {
          shallow: 'rgba(34, 193, 34, 0.3)',
          dark: 'rgba(34, 193, 34, 1)'
        }, // 第六种
        {
          shallow: 'rgba(51, 161, 201, 0.3)',
          dark: 'rgba(51, 161, 201, 1)'
        }, // 第七种
        {
          shallow: 'rgba(255, 192, 203, 0.3)',
          dark: 'rgba(255, 192, 203, 1)'
        }, // 第八种
        {
          shallow: 'rgba(244, 164, 96, 0.3)',
          dark: 'rgba(244, 164, 96, 1)'
        }, // 第九种
        {
          shallow: 'rgba(138, 199, 140, 0.3)',
          dark: 'rgba(138, 199, 140, 1)'
        } // 第十种
      ], // 预选标注颜色（十种，只需前端页面展示使用，后端数据无需提供和保存）
      // 选择文件上传相关
      accessoryList: [], //附件列表
      fileVoList: [], //上传接口需要的附件列表
      callback: null
    };
  },
  watch: {
    audioUrl() {
      this.initAudioWave()
    },
  },
  mounted() {
    this.audioUrl = require('../../assets/demo.mp3')
  },
  beforeDestroy() {
    this.wavesurfer && this.wavesurfer.unAll();
    this.wavesurfer && this.wavesurfer.destroy();
    this.wavesurfer = null;
    this.audioUrl = '';
  },
  methods: {

    // 上传的音频预览功能
    drapAudioToUpLoadAndPlay() {
      const pitchWorker = new Worker('/examples/pitch-worker.js', {type: 'module'})
      /**
       const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgba(200, 200, 200, 0.5)',
        progressColor: 'rgba(100, 100, 100, 0.5)',
        url: '../../assets/demo.mp3',
        minPxPerSec: 200,
        sampleRate: 11025,
      })
       **/

      // Pitch detection
      this.wavesurfer.on('decode', () => {
        const peaks = this.wavesurfer.getDecodedData().getChannelData(0)
        pitchWorker.postMessage({peaks, sampleRate: this.wavesurfer.options.sampleRate})
      })

      // When the worker sends back pitch data, update the UI
      pitchWorker.onmessage = (e) => {
        const {frequencies, baseFrequency} = e.data

        // Render the frequencies on a canvas
        const pitchUpColor = '#385587'
        const pitchDownColor = '#C26351'
        const height = 100

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = frequencies.length
        canvas.height = height
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        // Each frequency is a point whose Y position is the frequency and X position is the time
        const pointSize = devicePixelRatio
        let prevY = 0
        frequencies.forEach((frequency, index) => {
          if (!frequency) return
          const y = Math.round(height - (frequency / (baseFrequency * 2)) * height)
          ctx.fillStyle = y > prevY ? pitchDownColor : pitchUpColor
          ctx.fillRect(index, y, pointSize, pointSize)
          prevY = y
        })

        // Add the canvas to the waveform container
        this.wavesurfer.renderer.getWrapper().appendChild(canvas)
        // Remove the canvas when a new audio is loaded
        this.wavesurfer.once('load', () => canvas.remove())
      }

      // Play on click
      this.wavesurfer.on('interaction', () => {
        if (!this.wavesurfer.isPlaying()) this.wavesurfer.play()
      })

      // Drag'n'drop
      {
        const dropArea = document.querySelector('#drop')
        dropArea.ondragenter = (e) => {
          e.preventDefault()
          e.target.classList.add('over')
        }
        dropArea.ondragleave = (e) => {
          e.preventDefault()
          e.target.classList.remove('over')
        }
        dropArea.ondragover = (e) => {
          e.preventDefault()
        }
        dropArea.ondrop = (e) => {
          e.preventDefault()
          e.target.classList.remove('over')

          // Read the audio file
          const reader = new FileReader()
          reader.onload = (event) => {
            this.this.wavesurfer.load(event.target.result)
          }
          reader.readAsDataURL(e.dataTransfer.files[0])

          // Write the name of the file into the drop area
          dropArea.textContent = e.dataTransfer.files[0].name
          this.wavesurfer.empty()
        }
        document.body.ondrop = (e) => {
          e.preventDefault()
        }
      }

    },


    //点击附件内容
    handlePreview(file) {
      console.log("file是：", file.name);
      console.log("file信息：",);

    },
    //附件移除
    handleRemove(file) {
      this.$message.warning(`已移除${file.name}`);
      const index = this.fileVoList.findIndex(
          (item) => item.fileName == file.name
      );
      this.fileVoList.splice(index, 1);
      this.$emit("makeSure", this.fileVoList);
    },
    //自定义上传，如果是传action这里可以删掉这个方法，同时也删掉 :http-request这个属性
    async submitAccessoryList(param) {
      try {
        let formData = new FormData();
        formData.append("file", param.file);
        const res = await uploadAttachment(formData);
        this.fileVoList.push(res.data);

        if (this.fileVoList.length === this.accessoryList.length && typeof this.callback === 'function') {
          this.callback();
        }
      } catch (e) {
        console.log("上传失败", e);
      }
    },
    //确定上传附件
    submitUpload() {
      this.test().then((res) => {
        if (res.code == 200) {
          this.callback = () => {
            //这里是自定义附件列表的格式参数，因为我是需要这个样子的参数，所以重新格式化一下
            this.fileVoList = this.fileVoList.map((item) => {
              return {
                fileName: item.name,
                fileSize: item.size,
                fileUrl: item.url,
                id: item.id,
              };
            });
            this.$emit("makeSure", this.fileVoList); //这里调用父组件方法，是想把this.fileVoList传给父组件，然后在form表单当作参数传给后端
          }
        }
      });
    },
    //异步拿取附件数据
    test() {
      return new Promise((res, rej) => {
        if (this.accessoryList.length > 0) {
          this.$refs.upload.submit();
          res({code: 200});
        } else {
          this.$message.error('请选择上传文件')
          rej({code: 500});
        }
      });
    },
    //限制上传附件
    fileLimit(file, fileList) {
      var extension = file.name.substring(file.name.lastIndexOf('.') + 1);
      var size = file.size / 1024 / 1024;
      if (extension !== "mp3" && extension !== "wav" && extension !== "ogg") {
        this.$message.warning('只能传后缀名为.mp3、.wav、.ogg的音频文件')
        return
      }
      if (size > 100) {
        this.$message.warning("文件大小不得超过100M");
        return;
      }
      this.accessoryList = fileList;
    },

    //附件上传成功
    upSuccessAccessory() {
      this.$message.success("附件上传成功");
    },

    /** 设置标题颜色 */
    setColor() {
      if (!this.showList[this.curEditRegionIndex].color) return '#CCC';
      const color = this.showList[this.curEditRegionIndex].color.split(',');
      color[3] = '1)';
      return color.join(',');
    },


    /**
     * 点击标注片段切换对应文本框信息
     * @param {object} regionInfo 标注片段信息
     */
    changeTextArea(regionInfo) {
      this.curEditRegionIndex = this.showList.findIndex((item) => item.id === regionInfo.id); // 查找是否有对应标注
    },
    /** 初始化音频波插件 */
    initAudioWave() {
      this.$nextTick(() => {
        this.wavesurfer = WaveSurfer.create({
          container: this.$refs.waveform, // 音频波线的容器
          waveColor: '#ccc', // 波形的填充颜色（未播放区域）
          progressColor: 'skyblue', // 进度颜色
          backend: 'MediaElement',
          scrollParent: true, // 开启滚动
          cursorColor: 'red', // 指定进度光标颜色
          barMinHeight: 1, // 振幅最小高度
          barHeight: Number(this.barHeight), // 波形振幅
          mediaControls: false, // 启用媒体基本控件
          audioRate: '1', // 音频波放速度 数字约小播放约慢
          autoCenter: true, // 有滚动条音频线居中展示
          plugins: [
            RegionsPlugin.create({}), // 开启标注区
            Timeline.create({container: '#wave-timeline'}), // 开启时间线轴
            CursorPlugin.create({
              showTime: true, // 展示鼠标位置对应时间
              opacity: 1, // 透明度
              customShowTimeStyle: {
                backgroundColor: '#000',
                color: '#fff',
                padding: '2px',
                fontSize: '10px'
              } // 指针轴时间展示区样式
            }) // 插件--指针轴的配置
          ] // 插件
        });
        // 线上地址直接引用
        this.wavesurfer.load(this.audioUrl);
        this.wavesurfer.on('finish', () => {
          this.playFlag = false;
        }); // 播放完毕自动关闭
        this.wavesurfer.on('region-update-end', (obj) => {
          this.toUpdateShowList(obj);
        }); // 标注区更新
        this.wavesurfer.on('region-click', (obj) => {
          this.changeTextArea(obj);
        }); // 单击标注片段
        this.wavesurfer.on('waveform-ready', () => { // 音波图渲染完毕
          // 默认全选

        });
        this.wavesurfer.enableDragSelection({color: 'rgba(0,0,0,.3)'}); // 允许鼠标拖动创建标注区
        this.drawRegion(); // 有标注则自动绘制已标注部分
      });
    },

    /**
     * 选择标注类型
     * @param {number} index 标注类型索引
     */
    changeCurType(index) {
      this.curType = this.curType === index ? -1 : index;
    },
    /**
     * 通过自定义属性查找元素
     * @param {string} tag 元素
     * @param {string} attr 自定义属性名
     * @param {number} value 自定义属性值
     */
    getElementByAttr(tag, attr, value) {
      var aElements = document.getElementsByTagName(tag);
      var aEle = [];
      for (var i = 0; i < aElements.length; i++) {
        if (aElements[i].getAttribute(attr) === value) aEle.push(aElements[i]);
      }
      return aEle;
    },
    /**
     * 划过标注信息对应标注区高亮
     * @param {object} regionInfo 标注片段信息
     * @param {string} type 交互类型 enter->进入 leave->滑出
     */
    changeActive(regionInfo, type) {
      if (this.wavesurfer === null) return;
      let elm = this.getElementByAttr(
          'region',
          'data-id',
          `${regionInfo.id}`
      )[0];
      const color = regionInfo.color.split(',');
      color[3] = type === 'enter' ? '0.8)' : '0.3)';
      elm.style.backgroundColor = color.join(',');
      elm.style.border = type === 'enter' ? '2px dashed blue' : 'none';
      elm.style.boxSizing = 'border-box';
    },
    /**
     * 新建/更改 标注片段+自动切换文本框信息
     * 选择标注类型->创建新的标注片段
     * 未选择标注类型->仅预生成灰色选中区且不作为新的标注片段添加
     */
    toUpdateShowList(info) {
      const newArr = JSON.parse(JSON.stringify(this.showList));
      let ind = newArr.findIndex((item) => item.id === info.id); // 查找是否有对应标注
      let newRegion = this.curType > -1
          ? {
            id: new Date().getTime(),
            label: '',
            start: info.start,
            end: info.end,
            color: this.primaryColor[this.curType].shallow || '#ccc', // 如果选了类型则为对应类型颜色，否则为默认灰色
            class: [],
            speaker: this.fixedType[this.curType] || '坐席'
          }
          : {};
      if (ind === -1) { // 有类型才能添加标注数据
        this.curType > -1 && newArr.push(newRegion);
      } else { // 更新选择区选择范围
        newArr[ind].start = info.start;
        newArr[ind].end = info.end;
      }
      this.showList = newArr;
      this.drawRegion();
      ind === -1 && this.curType > -1 && this.changeTextArea(newRegion); // 创建新的选择区后自动切换文本框内容
    },
    /**
     * "播放/暂停"按钮
     * 单击触发事件，暂停的话单击则播放，正在播放的话单击则暂停播放
     */
    playMusic() {
      this.playFlag ? this.wavesurfer.pause() : this.wavesurfer.play();
      this.playFlag = !this.playFlag;
    },
    /** 绘制音轨标注片段 */
    drawRegion() {
      this.wavesurfer.clearRegions();
      this.showList.forEach((regionInfo) => {
        this.wavesurfer.addRegion({
          id: regionInfo.id,
          start: regionInfo.start, // 区域开始时间
          end: regionInfo.end, // 区域结束时间
          color: regionInfo.color, // 区域颜色
          drag: true, // 是否可拖拽
          resize: true // 是否可改变大小
        });
      });
    },

    /**
     * 点击提交，将所有的标注信息提交到数据库
     * **/
    submitAnnotation() {
      this.$confirm('此操作将提交所有的标注, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO:进行重置
        this.$message({
          type: 'success',
          message: '提交成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消提交'
        });
      });
    },

    /**
     * 点击重置，将所有的标注信息删除，初始化操作
     * **/
    initRegion() {
      this.$confirm('此操作将会丢失所有标注, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO:进行重置
        this.showList = [];
        this.drawRegion();
        this.$message({
          type: 'success',
          message: '重置成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消重置'
        });
      });
    },
    /**
     * 点击删除标注 自动切换文本框信息为已标注片段的最后一项
     * @param {number} id 标注信息ID
     */
    deleteRegion(id) {
      const newArr = JSON.parse(JSON.stringify(this.showList));
      let ind = newArr.findIndex((item) => item.id === id); // 查找是否有对应标注
      if (ind === -1) return;
      newArr.splice(ind, 1);
      this.showList = newArr;
      this.drawRegion();
      this.changeTextArea(newArr.length > 0 ? newArr[newArr.length - 1] : 0);
    },
    /**
     * 更改已标注片段的类型
     * @param {number} key 索引
     * @param {object} e 点击元素信息
     */
    editClass(key, e) {
      e.stopPropagation();
      const newArr = JSON.parse(JSON.stringify(this.showList));
      let index = newArr.findIndex((item) => item.id === this.showList[this.curEditRegionIndex].id);
      if (index === -1) return;
      newArr[index].speaker = this.fixedType[key];
      newArr[index].color = this.primaryColor[key].shallow;
      this.showList = newArr;
      this.drawRegion();
      this.isChange = false;
    },
    /**
     * 振幅放大/缩小
     * 该功能支持需要摒弃音频资源失效策略
     */
    changeBarHeight() {
      this.wavesurfer.unAll();
      this.wavesurfer.destroy();
      this.wavesurfer = null;
      this.initAudioWave();
    },
    /**
     * 波形图缩放
     * @param {number} val 缩放值
     * 调用zoom() API更改水平比例
     */
    zoom(val) {
      this.wavesurfer && this.wavesurfer.zoom(val);
    },
    /**
     * 设置音量
     * @param {number} val 音量值
     */
    setVolume(val) {
      this.wavesurfer && this.wavesurfer.setVolume(val / 100);
    },
    /**
     * 倍速播放
     * @param {number} rate 0.5-2的取值范围 加减差值为0.25
     */
    doubleSpeed(rate) {
      this.wavesurfer && this.wavesurfer.setPlaybackRate(rate);
    },


  }
};
</script>

<style scoped lang="scss">

.el-upload-list {
  width: 500px;
}

.drag {
  height: 220px;
  border: 1px dashed black;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: 40px;

  &-active {
    border: 1px dashed #2260FF;
  }

  &-title {
    font-size: 14px;
    color: grey;
  }

  &-subtile {
    font-size: 12px;
    color: #999999;
    margin-top: 30px;
    text-align: center;
    line-height: unset;
  }
}

.drop {
  height: 228px;
  border: 4px dashed #999;
  margin: 2em 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.drop.over {
  border-color: #333;
}

.mixin-components-container {
  background: #fff;
  height: max-content;
  border: none;
}

.colorTag {
  display: inline-block;
  height: 10px;
  width: 30px;
}

.primaryType {
  margin-top: 50px;
  width: 100%;
  color: #000;
  display: flex;

  > p {
    padding: 0 20px;
    margin-left: 20px;

    font-size: 20px;
    border: 2px solid #008cba;
    border-radius: 8px;
  }
}

.labelTextArea {
  width: 90%;
  height: max-content;
  margin-left: 30px;
  margin-top: 20px;
  padding-left: 10px;
  display: flex;

  > div {
    padding: 2px 10px;
    width: 80px;
    font-size: 20px;
    border-radius: 5px;
  }

  .detailInfo {
    width: 100%;
    display: flex;

    > div {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 50px;

      > p {
        height: max-content;
        margin-bottom: 0;
      }

      .deleteBtn {
        padding: 3px 10px;
        display: inline-block;

        border-radius: 5px;
        text-align: center;
        border-width: 2px;
        border: 2px solid #008cba;
        background: #e6e4e4;
        font-size: 20px;
        color: #000;
        margin-left: 50px;
      }
    }

    textarea {
      width: 100%;
      height: 80px;
      border: 1px solid #ccc;
    }
  }

  .tagArea {
    width: 100%;
    display: flex;
    padding: 0;
    margin: 10px auto 0;

    p {
      margin-bottom: 0;
    }

    .tagList {
      width: max-content;
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 0;

      p {
        margin-right: 30px;
        margin-bottom: 0 !important;
      }

      input {
        margin-right: 3px;
      }
    }
  }
}

.control {
  display: flex;
  height: max-content;
  align-items: center;

  .playBtn {
    margin: auto;
    height: max-content;

    i {
      display: block;
      font-size: 60px;
      color: #409EFF;
    }
  }

  .zoom {
    width: max-content;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 10px;

    > p {
      width: max-content;
      margin-bottom: 0;
    }

    input {
      width: 100px;
    }
  }
}

</style>

