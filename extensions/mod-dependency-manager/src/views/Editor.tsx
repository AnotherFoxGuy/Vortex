import * as actions from '../actions';

import { IModInfo, IReference, IRule, RuleType } from 'modmeta-db';
import { ComponentEx, actions as nmmActions } from 'nmm-api';
import * as React from 'react';
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

interface IDialog {
  gameId: string;
  modId: string;
  reference: IReference;
  type: RuleType;
}

interface IConnectedProps {
  dialog: IDialog;
}

interface IActionProps {
  onCloseDialog: () => void;
  onSetType: (type: RuleType) => void;
  onAddRule: (gameId: string, modId: string, rule: IRule) => void;
}

interface IComponentState {
  type: RuleType;
  reference: IReference;
}

type IProps = IConnectedProps & IActionProps;

class Editor extends ComponentEx<IProps, IComponentState> {
  constructor(props: IProps) {
    super(props);
    this.initState({ type: undefined, reference: undefined });
  }

  public componentWillReceiveProps(nextProps: IProps) {
    if (this.props.dialog !== nextProps.dialog) {
      if (nextProps.dialog !== undefined) {
        this.nextState.type = nextProps.dialog.type;
        this.nextState.reference = Object.assign({}, nextProps.dialog.reference, {
          versionMatch: '^' + nextProps.dialog.reference.versionMatch,
        });
      } else {
        this.nextState.type = undefined;
        this.nextState.reference = undefined;
      }
    }
  }

  public render(): JSX.Element {
    const { t, dialog } = this.props;
    const { reference, type } = this.state;

    return (<Modal show={dialog !== undefined} onHide={this.close}>
      {dialog !== undefined
        ? <Modal.Body>
          {dialog.modId}
          <FormControl
            componentClass='select'
            onChange={this.changeType}
            value={type}
            style={{ marginTop: 20, marginBottom: 20 }}
          >
            <option value='before'>{t('Must load before')}</option>
            <option value='after'>{t('Must load after')}</option>
            <option value='requires'>{t('Requires')}</option>
            <option value='conflicts'>{t('Can\'t be loaded together with')}</option>
          </FormControl>
          {this.renderReference(reference)}
        </Modal.Body>
        : null }
        <Modal.Footer>
          <Button onClick={this.close}>{t('Cancel')}</Button>
          <Button onClick={this.save}>{t('Save')}</Button>
        </Modal.Footer>
    </Modal>);
  }

  private renderReference = (reference: IReference): JSX.Element => {
    const {t} = this.props;
    const {modId, logicalFileName, versionMatch, fileExpression, fileMD5} = reference;

    if (logicalFileName === '') {
      return (
        <Form horizontal>
          <FormGroup>
            <Col sm={3} componentClass={ControlLabel}>{t('MD5')}</Col>
            <Col sm={9}>
              <FormControl
                type='text'
                value={fileMD5}
                readOnly={true}
              />
            </Col>
          </FormGroup>
        </Form>);
    }

    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>{t('Mod ID')}</Col>
          <Col sm={9}>
            <FormControl
              type='text'
              value={modId}
              readOnly={true}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>{t('Name')}</Col>
          <Col sm={9}>
            <FormControl
              type='text'
              value={logicalFileName || fileExpression}
              readOnly={true}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>{t('Version Match')}</Col>
          <Col sm={9}>
            <FormControl
              type='text'
              value={versionMatch}
              readOnly={true}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  }

  private changeType = (event) => {
    this.nextState.type = event.currentTarget.value;
  }

  private save = () => {
    const { dialog, onAddRule } = this.props;
    const { reference, type } = this.state;

    onAddRule(dialog.gameId, dialog.modId, {
      reference,
      type,
    });

    this.close();
  }

  private close = () => {
    this.props.onCloseDialog();
  }
}

function mapStateToProps(state: any): IConnectedProps {
  return {
    dialog: state.session.dependencies.dialog,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<any>): IActionProps {
  return {
    onCloseDialog: () => dispatch(actions.closeDialog()),
    onSetType: (type) => dispatch(actions.setType(type)),
    onAddRule: (gameId, modId, rule)  => dispatch(nmmActions.addModRule(gameId, modId, rule)),
  };
}

export default translate([ 'common' ], { wait: false })(
  connect(mapStateToProps, mapDispatchToProps)(Editor)) as React.ComponentClass<{}>;