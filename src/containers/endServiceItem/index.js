import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { Header, Segment, Input, Label, Form, Button, Message, Grid, Select, Dropdown, TextArea, Progress } from "semantic-ui-react";
import { push } from 'react-router-redux';
import axios from 'axios';

import BaseLayout from "../baseLayout";

import { addServiceItem, setUpdatingServiceItem, updateServiceItem } from "./../../actions/ServiceItemActions";


function validate(values) {
    var errors = {
        batch: {}
    };
 
    const { start_service_date, item_id} = values;

    if (!start_service_date || (start_service_date + "").trim() === "") {
        errors.start_service_date= "Tanggal Mulai Perbaikan Mohon Dilengkapi";
    }
    if (!item_id) {
        errors.item_id= "Nama Alat Kerja Mohon Dilengkapi";
    }
    return errors;
}

class AddEndServiceItem extends Component {
    constructor() {
        super();
        this.state = {
            items: [],
            picture: '',
            kwitansi: '',
            loaded: 0,
            selectedFile: null,
            loadedPdf: 0
        };
        this.handleChange = this.handleChange.bind(this);
        this.onChangeFileUpload = this.onChangeFileUpload.bind(this);
        this.onChangePictureUpload = this.onChangePictureUpload.bind(this);
    }

    componentWillMount() {
        const idParam = this.props.location.pathname.split("/")[2]; // Hacky Way
        const { dispatch,token } = this.props;
        if (idParam) {
            dispatch(setUpdatingServiceItem(idParam));
        }
    }
    
    componentDidMount() {
        const { token } = this.props;
        axios.get('https://warehouse-server.herokuapp.com/items/available',
      {headers: {
        Authorization : token
      }
      })
      .then(response => {
        this.setState({ items: response.data });
      })
      .catch(error => console.log(error.response));
    }

    renderField({ input, meta: { touched, error }, ...custom }) {
        const hasError = touched && error !== undefined;
        return (
            <div>
                <Input type="text" error={hasError} fluid {...input} {...custom} />
                {hasError && <Label basic color="red" pointing>{error}</ Label>}
            </div>
        )
    }

    renderTextAreaField({ input, meta: { touched, error }, ...custom }) {
        const hasError = touched && error !== undefined;
        return (
            <div>
                <TextArea error={hasError} fluid {...input} {...custom} />
                {hasError && <Label basic color="red" pointing>{error}</ Label>}
            </div>
        )
    }

    renderFieldFile({ input, meta: { touched, error }, ...custom }) {
        const hasError = touched && error !== undefined;
        delete input.value;
        return (
            <div>
                <Input type="file" error={hasError} fluid {...input} {...custom} />
                {hasError && <Label basic color="red" pointing>{error}</ Label>}
            </div>
        )
    }

    renderSelectField({ input, meta: { touched, error }, ...custom }){
        const hasError = touched && error !== undefined;
        return (
            <div>
                <Select error={hasError} fluid {...input} {...custom} />
                {hasError && <Label basic color="red" pointing>{error}</ Label>}
            </div>
        )
    }

    handleChange(event) {
        this.setState({value: event.target.data});
        console.log('Info: Come from handleChange');
        console.log(this.state);
      }
       
       
    onSubmit(values, dispatch) {
        const { token } = this.props.auth;
        values.token = token;
        values = Object.assign(values, {...this.state})
        console.log(values)
        if (values.id) {
            return dispatch(updateServiceItem(values)).then(function (data) {
                dispatch(push("/serviceItem/"));
            });
        }
        else {
            return dispatch(addServiceItem(values)).then(function (data) {
                dispatch(push("/serviceItem"));
            });
        }
    }

    onChangePictureUpload(event) {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        axios.post('https://warehouse-server.herokuapp.com/serviceItem/uploads', formData, {
            onUploadProgress: ProgressEvent => {
              this.setState({
                loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
              })
            }}).then(response => {
            if(this.checkFileSize(event)){
                this.setState({
                    picture: response.data,
                    selectedFile: response.data
    
                })
            }
           
        }).catch(err => { // then print response status
            alert(err)
          })
    }

    onChangeFileUpload(event) {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        axios.post('https://warehouse-server.herokuapp.com/serviceItem/uploadspdf', formData, {
            onUploadProgress: ProgressEvent => {
              this.setState({
                loadedPdf: (ProgressEvent.loaded / ProgressEvent.total*100),
              })
            }}).then(response => {
            if(this.checkFileSize(event)){
                this.setState({
                    kwitansi: response.data.path,
                    selectedFile: response.data
    
                })
            }
        }).catch(err => { // then print response status
            alert(err)
        })
    }

    checkFileSize=(event)=>{
        let files = event.target.files
        let size = 512000
        let err = ""; 
        for(var x = 0; x<files.length; x++) {
        if (files[x].size > size) {
         err += files[x].type+'\nMaksimal Upload 500 KB\n';
       }
     };
     if (err !== '') {
        event.target.value = null
        alert(err)
        return false
   }
   
   return true;
   
   }

    render() {
        const { handleSubmit, pristine, initialValues, errors, submitting } = this.props;
        let { token, user, isLoggingIn, addingServiceItemError, serviceItem } = this.props.serviceItem;
        let error = null;
        let items = this.state.items; 
 
        if (addingServiceItemError) {
            error = (
                <Message negative>
                    <Message.Header>Kesalahan saat menambahkan Data Perbaikan Alat Kerja, pastikan kembali Hak Akses telah sesuai.</Message.Header>
                    <p>{addingServiceItemError}</p>
                </Message>
            )
        }
        let buttonText = null;
        if (serviceItem) {
            buttonText = "Perbarui Data";
        }
        else {
            buttonText = "Tambahkan Data";
        }
        return (
            <BaseLayout>
                <Segment>
                    <Header textAlign='center' as="h2">Penyelesaian Perbaikan Alat Kerja</Header>
                    {error}
                    <Form onSubmit={handleSubmit(this.onSubmit.bind(this))} loading={isLoggingIn}>
                        <Form.Field>
                            <label>Tanggal Mulai Perbaikan</label>
                            <Field name="start_service_date" placeholder="Masukkan Tanggal Mulai Perbaikan Alat Kerja" component={this.renderField} disabled></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Nama Alat Kerja</label>
                            <Field name="item_name" placeholder="Masukkan Nama Alat Kerja" component={this.renderField} disabled></Field>
                            {/* <Field name= 'item_id' component="select" > */}
                            {/* <option></option>
                            {items.map((item) => (
                                    <option key={item.id} value={item.id}>{item.item_name.en}</option>  
                            ))} */}
                            
                        </Form.Field>
                        <Form.Field inline>
                            <label>Biaya Perbaikan</label>
                            <Field name="cost_service" placeholder="Masukkan Biaya Perbaikan Alat Kerja" component={this.renderField}></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Gambar Setelah Perbaikan</label>
                            <Field name="picture" component={this.renderFieldFile} onChange={this.onChangePictureUpload}></Field>
                            {this.checkFileSize}
                            <Progress percent={this.state.loaded} success attached='bottom'></Progress>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Tanggal Selesai Perbaikan</label>
                            <Field type="date" name="end_service_date" placeholder="Masukkan Tanggal Selesai Perbaikan" component={this.renderField}></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Kwitansi</label>
                            <Field name="kwitansi" component={this.renderFieldFile} onChange={this.onChangeFileUpload}></Field>
                            {this.checkFileSize}
                            <Progress percent={this.state.loadedPdf} success attached='bottom'></Progress>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Rincian Perbaikan</label>
                            <Field type= "textarea" name="detail_service" placeholder="Masukkan Rincian Perbaikan Alat Kerja" component={this.renderTextAreaField}></Field>
                        </Form.Field>
                        <Grid>
                        <Grid.Column textAlign="center">
                        <Button primary loading={submitting} disabled={submitting}>{buttonText}</Button>
                        </Grid.Column>
                        </Grid>
                    </Form>
                </Segment>
            </BaseLayout>
        )
    }
}

function mapStatesToProps(state) {
    const initialValues = state.serviceItem.serviceItem;
    return {
        initialValues: initialValues,
        auth: state.auth,
        serviceItem: state.serviceItem,
        location: state.router.location,
        token: state.auth.token,

    }
}

export default connect(mapStatesToProps)(reduxForm({
    form: "AddEndServiceItem",
    validate
})(AddEndServiceItem));