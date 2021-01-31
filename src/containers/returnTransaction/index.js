import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { Header, Segment, Input, Label, Form, Button, Message, Grid, Select, Dropdown } from "semantic-ui-react";
import { push } from 'react-router-redux';
import axios from 'axios';

import BaseLayout from "../baseLayout";

import { addBorrowTransaction, setUpdatingBorrowTransaction, updateBorrowTransaction } from "./../../actions/BorrowTransactionActions";


function validate(values) {
    var errors = {
        batch: {}
    };
 
    const { borrow_date, item_id, project_location} = values;
    if (!borrow_date || (borrow_date + "").trim() === "") {
        errors.borrow_date = "Tanggal Peminjaman Mohon Dilengkapi";
    }
    if (!item_id) {
        errors.item_id= "Nama Alat Kerja Mohon Dilengkapi";
    }
    if (!project_location || (project_location + "").trim() === "") {
        errors.project_location= "Lokasi Kerja Mohon Dilengkapi";
    }
   
    return errors;
}

class AddReturnTransaction extends Component {
    constructor() {
        super();
        this.state = {
            items: []
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        const idParam = this.props.location.pathname.split("/")[2]; // Hacky Way
        const { dispatch,token } = this.props;
        if (idParam !== "add") {
            dispatch(setUpdatingBorrowTransaction(idParam));
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
        if (values.id) {
            return dispatch(updateBorrowTransaction(values)).then(function (data) {
                dispatch(push("/borrowTransaction"));
            });
        }
        else {
            return dispatch(addBorrowTransaction(values)).then(function (data) {
                dispatch(push("/borrowTransaction"));
            });
        }
    }

    render() {
        const { handleSubmit, pristine, initialValues, errors, submitting } = this.props;
        let { token, user, isLoggingIn, addingBorrowTransactionError, borrowTransaction } = this.props.borrowTransaction;
        let error = null;

        let items = this.state.items; 
        if (addingBorrowTransactionError) {
            error = (
                <Message negative>
                    <Message.Header>Kesalahan saat menambahkan Transaksi Peminjaman, pastikan kembali Hak Akses telah sesuai.</Message.Header>
                    <p>{addingBorrowTransactionError}</p>
                </Message>
            )
        }
        let buttonText = null;
        if (borrowTransaction) {
            buttonText = "Tambah Transaksi Pengembalian";
        }
        else {
            buttonText = "Tambah Transaksi Peminjaman";
        }
        return (
            <BaseLayout>
                <Segment>
                    <Header textAlign='center' as="h2">Transaksi Pengembalian</Header>
                    {error}
                    <Form onSubmit={handleSubmit(this.onSubmit.bind(this))} loading={isLoggingIn}>
                        <Form.Field>
                            <label>Tanggal Pinjam</label>
                            <Field name="borrow_date" placeholder="Masukkan Tanggal Peminjaman" component={this.renderField} disabled></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Nama Alat Kerja</label>
                            <Field name= 'item_name' disabled component = {this.renderField} >
                            </Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Lokasi Kerja</label>
                            <Field name="project_location" placeholder="Masukkan Lokasi Kerja" component={this.renderField} disabled></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <label>Tanggal Pengembalian</label>
                            <Field type="date" name="return_date" placeholder="Masukkan Tanggal Pengembalian" component={this.renderField}></Field>
                        </Form.Field>
                        <Grid>
                        <Grid.Column textAlign="center">
                        <Button loading={submitting} disabled={submitting}>{buttonText}</Button>
                        </Grid.Column>
                        </Grid>
                    </Form>
                </Segment>
            </BaseLayout>
        )
    }
}

function mapStatesToProps(state) {
    const initialValues = state.borrowTransaction.borrowTransaction;
    return {
        initialValues: initialValues,
        auth: state.auth,
        borrowTransaction: state.borrowTransaction,
        location: state.router.location,
        token: state.auth.token,
    }
}

export default connect(mapStatesToProps)(reduxForm({
    form: "AddReturnTransaction",
    validate
})(AddReturnTransaction));