<template>
    <div class="portsWeather" >
        <template v-if="ports.length>0&&loading">
            <div class="portsNav"  ref="portsNav" >
                <div>   
                    <div :class="['port',{'active':selectedPort===port}]" v-for="port in ports"  @click="_handlePortClick(port)" :key="port.PORTID">
                        {{port.PORTNAME}}
                    </div>
                </div>
            </div>
            <div class="portInfo" v-if="selectedPort&&weathers"  ref="portInfo">
                <div class="infoHead">
                    <img  src="" v-lazy="'http://10.246.146.29/COLSGIS/PortWeather/images/Port/'+selectedPort.PORTNAME+'.png'" :key="selectedPort.PORTID"/>
                    <span><h1>{{selectedPort.PORTNAME}}</h1> {{selectedPort.TIME | formatDate}} &nbsp; {{selectedPort.TIME | dateTrans}}</span>
                </div>
                <div class="title">天气</div>
                <div class="weatherInfo">
                    <div class="infoHead">
                        <img  src="" v-lazy="'http://10.246.146.29/COLSGIS/PortWeather/images/Weather/'+selectedPort.METEOROLOGICAL+'.png'" :key="selectedPort.PORTID"/>
                        <span><h2>{{selectedPort.TEMPERATURENOW}}℃</h2> {{selectedPort.WINDDIRECTION}}</span>
                    </div>
                    <div class="weatherList top">
                        <span>今天</span>
                        <span>{{selectedPort.TIME | dateTrans}}</span>
                        <img src="">
                        <span>{{selectedPort.TEMPERATUREMIN}}&nbsp;{{selectedPort.TEMPERATUREMAX}}</span>
                    </div>
                    <div class="weatherList" v-for="weather in weathers" :key="weather.ID" >
                        <span>{{weather.TIME | formatDate}}</span>
                        <span>{{weather.TIME | dateTrans}}</span>
                        <img src="" v-lazy="'http://10.246.146.29/COLSGIS/PortWeather/images/Weather/'+weather.METEOROLOGICAL+'.png'">
                        <span>{{weather.TEMPERATUREMIN}}&nbsp;{{weather.TEMPERATUREMAX}}</span>
                    </div>
                </div>
                <div class="title">潮汐</div>
                <div class="tideInfo">
                    <div class="tideTime">
                        <span>&nbsp;时间：</span>
                        <el-date-picker
                        size="mini"
                            :editable="false"
                            :clearable="false"
                            v-model="pickDate"
                            type="date"
                            :placeholder="pickDate.toString()"
                            @change="_getPortTide">
                        </el-date-picker>
                    </div>
                    <div class="tideDetail">
                        <div>
                            <span>潮时(Hrs)</span>
                            <span>潮高(m)</span>
                        </div>
                        <div v-for="(tide,index) in tideInfo" :key="index">
                            <span>{{tide.TIDETIME | formatDateShort}}</span>
                            <span>{{tide.TIDEHIGH}}</span>
                        </div>
                    </div>
                    <div class="tideGrapic">
                        <HighCharts :series="grapicInfo"  :options="options" :styles="styles"  ref="simpleChart"></HighCharts>
                    </div>
                </div>
            </div>
            <div class="ports-error" v-if="!ports.length">网络连接不给力，请检查网络设置</div>
        </template>
        <template v-else>
            <div class="ports-error" >数据异常</div>
        </template>
    </div>
</template>

<script type="es6">
import BScroll from 'better-scroll';
import HighCharts from '@/components/HighCharts';
// import { Loading } from 'element-ui';
export default {
    data:function(){
        return{
            loading:false,
            ports:[],//港口
            weathers:[],//港口7天天气
            selectedPort:null,//选中的港口
            pickDate:new Date().toLocaleDateString().toString().replace(/\//g,'-'),//潮汐模块日期选择
            tideInfo:[],//港口潮汐
            //以下为绘图信息
            grapicInfo:[],
            grapic_tide:{
                name:null,
                data:[]
            },
            options:{
                chart:{//面积图
                    type:'spline'
                },
                global:{
                    useUTC: false
                },
                title:{//标题不显示
                    text:null
                },
                xAxis: {//x轴
                    type: 'datetime',
                    tickInterval: 3600 *1000,//间距为小时
                    dateTimeLabelFormats: {//格式化时间
                        hour:'%H:%M:%S',
                        day: '%Y-%m-%d'
                    }
                },
                legend:{//不显示图例   
                    enabled:false
                },
                yAxis: {//y轴
                    title: {
                        text: null
                    },
                    lineWidth: 1,
                    tickPixelInterval:36,
                    labels:{//标签显示
                        formatter:function(){
                            return this.value+'m';
                        }
                    }
                },
                credits:{
                    enabled: false // 禁用版权信息
                },
            },
            styles: {
              width: 100,
              height: 100
            }
        }
    },
    components:{
        HighCharts
    },
    mounted(){
        this._initPage();
    },
    watch:{
        selectedPort:function(){
            this._getPortTide();
        },
        tideInfo:function(){
            if(this.tideInfo){
                this.grapic_tide.name=this.selectedPort.PORTNAME+'潮高';
                this.grapic_tide.data=this.tideInfo.map(function(value){
                    return [new Date(value.TIDETIME).getTime()+28800000,Number(value.TIDEHIGH)]//highCharts时间采用UTC国际时间，需往后加8小时
                })
                this.grapicInfo=[];
                this.grapicInfo.push(this.grapic_tide);
            }
        }
    },
    methods:{
        //获取港口潮汐
        _getPortTide:function(){
             return this.$http.get('http://10.246.172.130/COLSAPI/CRUDE/SAILSCHEDULE/GetTideByTime',{
                    params:{
                        PORTID:this.selectedPort.PORTID,
                        STARTDATE:this.pickDate,
                        ENDDATE:this.pickDate
                    }
                }).then(({data})=>{
                    this.tideInfo=data.rows[0].TideDetail.filter(function(value){
                        let reg=/(\d{2}\/\d{2}\/\d{4})\s((04|11|16|23):[0]{2}:[0]{2})/g;
                        if(reg.test(value.TIDETIME))return value;//只取每天4点，11点，16点，23点的数据
                    });
                }).catch((error)=>{
                    console.log(error);
            })
        },
        //获取港口7天的天气
        _getPortWeather:function(port){
            return this.$http.get('http://10.246.172.130/COLSAPI/CRUDE/SAILSCHEDULE/GetFuturePortWeather',{
                    params:{
                        PORTID:port.PORTID
                    }
            }).then(({data})=>{
                    this.weathers=data.rows;
            }).catch((error)=>{
                    console.log(error);
            })
        },
        //获取港口
        _getPorts:function(){
            return  this.$http.get('http://10.246.172.130/COLSAPI/CRUDE/SAILSCHEDULE/GetPortWeather?PORTID=').then(({data})=>{
                this.ports=data.rows;
             }).catch((error)=>{
                console.log(error);
            })
        },
        //页面初始化
        _initPage:function(){
            this._getPorts().then(()=>{
                // let loadingInstance = Loading.service({});
                if(this.ports.length){
                    var port=this.ports[0];//默认选中第一个港口
                    this.selectedPort=port;
                    this._getPortWeather(port).then(()=>{
                    this.loading=true;
                    this.$nextTick(()=>{
                        this.scroll = new BScroll(this.$refs.portsNav, {click:true});
                        // loadingInstance.close();
                        });
                    });
                }
            })
        },
        //港口点击事件
        _handlePortClick:function(port){
            this.selectedPort=port;
            this._getPortWeather(port);
        },
        // _initScroll(){
        // //初始化需要滚动的对象,通过vm.$refs可以获取到在<template>中设置ref=menuWrapper属性的元素节点
        //     if (!this.scroll) {
        //             this.scroll = new BScroll(this.$refs.portsNav, {
        //               click: true
        //             });
        //           } else {
        //             this.scroll.refresh();
        //           };
        //      this.portsNav = new BScroll(this.$refs.portsNav,{});
        // } 
    },
    filters:{
        formatDate:function(value){
            if(value){
                let shortDate=value.replace(/\-/g,'月').substring(5,10).replace(/\b(0+)/gi,"");
                return shortDate+"日";
            }
        },
        dateTrans:function(value){
            if(value){
                var date = new Date(value.replace(/-/g,"/"));
                var today = new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六');
                var week = today[date.getDay()];
                return week;
            }
        },
        formatDateShort:function(value){
            if(value){
                return value.substring(value.length-8);
            }
        }
    }
}
</script>

<style >
.title{
    margin:2%;
}
.tideTime{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: #606266;
    margin-top:1%;
}
.tideTime .el-input__inner{
    border: 0;
}
.tideDetail{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
.tideDetail div{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
}
.tideDetail span{
    height: 0.6rem;
    line-height: 0.6rem;
}
.tideGrapic{
    width: 100%;
    height: 7rem;
}
.portsWeather{
    display: flex;
    flex-direction:column;
    background:#f7f8fb;
    font-size: .25rem;
    padding-right: 0.2rem;
}
.portsNav{
    width: 20%;
    display: flex;
    flex-direction: column;
    height:12rem;
    position: fixed;
    top: 48px;
    overflow: hidden;
}
.portsNav :last-child{
     border-bottom: #c0c0cc solid 0.01rem;
}
.port{
    height: 0.815rem;
    line-height: 0.815rem;
    text-align: center;
    background: #fff;
    border-top: #c0c0cc solid 0.01rem;
    border-right: #c0c0cc solid 0.01rem;
}
.active{
    background: #f7f8fb;
    border-right: 0;
    color:#de4037;
}
.portInfo{
    margin-left: 22%;
    width: 78%;
    display: flex;
    flex-direction: column; 
    overflow: hidden;
}
.infoHead{
    display:flex;
    height:1.5rem;
    padding: 2.5% 0 2.5% 0;
}
.infoHead  img{
    width:40%;
    border-radius: 0.1rem;
}
.infoHead span{
    display: flex;
    width: 60%;
    flex-direction: column; 
    justify-content:space-around;
     text-align: center;
}
.infoHead span h1{
    margin: 0;
    font-weight: 400;
    font-size: .7rem;
    color:#9e9e9e;
}
.infoHead span h2{
    margin: 0;
    font-weight: 400;
    font-size: .6rem;
}

.weatherInfo,.tideInfo{
    background: #fff;
    border: #c0c0cc solid 0.01rem;
    display: flex;
    flex-direction: column;
    border-radius: 0.15rem;
    padding: 0.1rem;
    box-shadow: 0.02rem 0.02rem #c0c0cc ;
}
.weatherInfo .infoHead{
    padding: 0 0 0 10%;
}
.weatherInfo .infoHead img{
    width: 30%; 
    margin-left: 7%;
}
.weatherInfo .infoHead span{
    width: 70%; 
}

.weatherList{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content:flex-start;
    text-align: center;
    height: 0.6rem;
    line-height: 0.6rem;
}
.weatherList img{
    width: 10%;
}
.weatherList span{
    width: 30%;
}
.top{
    border-bottom: #c0c0cc solid 0.02rem;
}
.ports-error{
    text-align: center;
    color: #c0c0cc;
    font-size: .3rem;
    margin:0.1rem;
    padding: .1rem
}
</style>
